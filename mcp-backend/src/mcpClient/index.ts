import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  CallToolResultSchema,
  ListToolsResultSchema,
  ListResourcesResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { z } from "zod";

// Default timeout for MCP requests in milliseconds
const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

// MCP server configuration schema
const AutoApproveSchema = z.array(z.string()).default([]);

const BaseConfigSchema = z.object({
  autoApprove: AutoApproveSchema.optional(),
  disabled: z.boolean().optional(),
  timeout: z.number().min(5).optional().default(30),
});

const SseConfigSchema = BaseConfigSchema.extend({
  url: z.string().url(),
}).transform((config) => ({
  ...config,
  transportType: "sse" as const,
}));

const StdioConfigSchema = BaseConfigSchema.extend({
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
}).transform((config) => ({
  ...config,
  transportType: "stdio" as const,
}));

const ServerConfigSchema = z.union([StdioConfigSchema, SseConfigSchema]);

export const McpSettingsSchema = z.object({
  mcpServers: z.record(ServerConfigSchema),
});

export type McpServerConfig = z.infer<typeof ServerConfigSchema>;
export type McpConnection = {
  name: string;
  client: Client;
  transport: StdioClientTransport | SSEClientTransport;
  tools: McpTool[];
  resources: McpResource[];
  disabled: boolean;
  status: "connected" | "disconnected" | "connecting";
  error?: string;
};

export type McpTool = {
  name: string;
  description: string;
  schema: any;
  autoApprove: boolean;
};

export type McpResource = {
  uri: string;
  mimeType: string;
  title?: string;
  description?: string;
};

export class McpClient {
  private configPath: string;
  private connections: McpConnection[] = [];
  private clientVersion: string = "1.0.0";

  constructor(configPath: string) {
    this.configPath = configPath;
  }

  async initialize(): Promise<void> {
    try {
      const config = await this.readConfig();
      if (config) {
        await this.setupConnections(config.mcpServers);
      }
    } catch (error) {
      console.error("Failed to initialize MCP client:", error);
      throw error;
    }
  }

  private async readConfig(): Promise<z.infer<typeof McpSettingsSchema> | null> {
    try {
      const content = await fs.readFile(this.configPath, "utf-8");
      const config = JSON.parse(content);
      const result = McpSettingsSchema.safeParse(config);
      
      if (!result.success) {
        console.error("Invalid MCP config schema:", result.error);
        return null;
      }
      
      return result.data;
    } catch (error) {
      console.error("Failed to read MCP config:", error);
      return null;
    }
  }

  private async setupConnections(servers: Record<string, McpServerConfig>): Promise<void> {
    for (const [name, config] of Object.entries(servers)) {
      if (config.disabled) {
        continue;
      }
      
      try {
        await this.connectToServer(name, config);
      } catch (error) {
        console.error(`Failed to connect to MCP server ${name}:`, error);
      }
    }
  }

  private async connectToServer(name: string, config: McpServerConfig): Promise<void> {
    try {
      const client = new Client(
        {
          name: "LangChainMCPClient",
          version: this.clientVersion,
        },
        {
          capabilities: {},
        }
      );

      let transport: StdioClientTransport | SSEClientTransport;

      if (config.transportType === "sse") {
        transport = new SSEClientTransport(new URL(config.url), {});
      } else {
        transport = new StdioClientTransport({
          command: config.command,
          args: config.args,
          env: {
            ...config.env,
            ...(process.env.PATH ? { PATH: process.env.PATH } : {}),
          },
          stderr: "pipe",
        });
      }

      // Set up error handling
      transport.onerror = (error) => {
        console.error(`Transport error for "${name}":`, error);
        const connection = this.connections.find((conn) => conn.name === name);
        if (connection) {
          connection.status = "disconnected";
          connection.error = error.message;
        }
      };

      transport.onclose = () => {
        const connection = this.connections.find((conn) => conn.name === name);
        if (connection) {
          connection.status = "disconnected";
        }
      };

      // Add connection to list
      const connection: McpConnection = {
        name,
        client,
        transport,
        tools: [],
        resources: [],
        disabled: !!config.disabled,
        status: "connecting",
      };
      
      this.connections.push(connection);

      if (config.transportType === "stdio") {
        await transport.start();
        transport.onerror = (error) => {
          console.error(`Server "${name}" transport error:`, error.message);
          const conn = this.connections.find((c) => c.name === name);
          if (conn) {
            conn.error = conn.error ? `${conn.error}\n${error.message}` : error.message;
          }
        };
        
        // No-op for the start method to prevent double initialization
        transport.start = async () => {};
      }

      // Connect to the server
      await client.connect(transport);
      
      // Update connection status
      connection.status = "connected";
      
      // Fetch tools and resources
      connection.tools = await this.fetchTools(name);
      connection.resources = await this.fetchResources(name);
      
    } catch (error) {
      // Update connection status with error
      const connection = this.connections.find((conn) => conn.name === name);
      if (connection) {
        connection.status = "disconnected";
        connection.error = error instanceof Error ? error.message : String(error);
      }
      throw error;
    }
  }

  private async fetchTools(serverName: string): Promise<McpTool[]> {
    try {
      const connection = this.connections.find((conn) => conn.name === serverName);
      if (!connection) {
        throw new Error(`No connection found for server: ${serverName}`);
      }

      const response = await connection.client.request(
        { method: "tools/list" },
        ListToolsResultSchema,
        { timeout: DEFAULT_REQUEST_TIMEOUT_MS }
      );

      // Get auto-approve settings from config
      const config = await this.readConfig();
      const autoApproveConfig = config?.mcpServers[serverName]?.autoApprove || [];

      // Mark tools as auto-approved based on config
      const tools = (response?.tools || []).map((tool) => ({
        name: tool.name,
        description: tool.description || "",
        schema: tool.inputSchema, // Map inputSchema to schema
        autoApprove: autoApproveConfig.includes(tool.name),
      }));

      return tools;
    } catch (error) {
      console.error(`Failed to fetch tools for ${serverName}:`, error);
      return [];
    }
  }

  private async fetchResources(serverName: string): Promise<McpResource[]> {
    try {
      const connection = this.connections.find((conn) => conn.name === serverName);
      if (!connection) {
        throw new Error(`No connection found for server: ${serverName}`);
      }

      const response = await connection.client.request(
        { method: "resources/list" },
        ListResourcesResultSchema,
        { timeout: DEFAULT_REQUEST_TIMEOUT_MS }
      );

      return (response?.resources || []).map((resource) => ({
        ...resource,
        mimeType: resource.mimeType || "application/octet-stream", // Default mimeType
      }));
    } catch (error) {
      console.error(`Failed to fetch resources for ${serverName}:`, error);
      return [];
    }
  }

  async callTool(serverName: string, toolName: string, args?: Record<string, unknown>): Promise<any> {
    const connection = this.connections.find((conn) => conn.name === serverName);
    if (!connection) {
      throw new Error(`No connection found for server: ${serverName}`);
    }

    if (connection.status !== "connected") {
      throw new Error(`Server "${serverName}" is not connected`);
    }

    if (connection.disabled) {
      throw new Error(`Server "${serverName}" is disabled`);
    }

    // Get tool timeout from config
    const config = await this.readConfig();
    const serverConfig = config?.mcpServers[serverName];
    const timeout = serverConfig?.timeout ? serverConfig.timeout * 1000 : DEFAULT_REQUEST_TIMEOUT_MS;

    const response = await connection.client.request(
      {
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args || {},
        },
      },
      CallToolResultSchema,
      { timeout }
    );

    return response;
  }

  getConnections(): McpConnection[] {
    return this.connections;
  }

  getTools(serverName?: string): McpTool[] {
    if (serverName) {
      const connection = this.connections.find((conn) => conn.name === serverName);
      return connection?.tools || [];
    }
    
    // Return all tools from all servers
    return this.connections.flatMap((conn) => conn.tools);
  }

  async dispose(): Promise<void> {
    for (const connection of this.connections) {
      try {
        await connection.transport.close();
        await connection.client.close();
      } catch (error) {
        console.error(`Failed to close connection for ${connection.name}:`, error);
      }
    }
    this.connections = [];
  }
}