import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { McpClient, type McpTool } from "../mcpClient/index.js";
import { createMessage, createChat, getMessagesByChatId } from "./chatService.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Supported model providers
type ModelProvider = "openai" | "anthropic" | "groq";

// Model configuration
interface ModelConfig {
  provider: ModelProvider;
  modelName: string;
  apiKey: string;
}

export class ChatService {
  private models: Map<string, ChatOpenAI | ChatAnthropic | ChatGroq | ChatGoogleGenerativeAI> = new Map();
  private mcpClient: McpClient;
  private tools: DynamicStructuredTool[] = [];

  constructor(
    models: ModelConfig[],
    mcpConfigPath: string
  ) {
    // Initialize models
    for (const model of models) {
      const modelId = `${model.provider}/${model.modelName}`;
      
      if (model.provider === "openai") {
        this.models.set(modelId, new ChatOpenAI({
          model: model.modelName,
          apiKey: model.apiKey,
        }));
      } else if (model.provider === "anthropic") {
        this.models.set(modelId, new ChatAnthropic({
          model: model.modelName,
          apiKey: model.apiKey,
        }));
      } else if (model.provider === "groq") {
        this.models.set(modelId, new ChatGroq({
          model: model.modelName,
          apiKey: model.apiKey,
        }));
      }else if (model.provider === "gemini") {
        this.models.set(modelId, new ChatGoogleGenerativeAI({
          model: model.modelName,
          apiKey: model.apiKey,
        }));
      } 
    }

    // Initialize MCP client
    this.mcpClient = new McpClient(mcpConfigPath);
  }

  async initialize(): Promise<void> {
    // Initialize the MCP client
    await this.mcpClient.initialize();
    
    // Convert MCP tools to LangChain tools
    await this.setupTools();
  }

  private async setupTools(): Promise<void> {
    const mcpTools = this.mcpClient.getTools();
    
    for (const tool of mcpTools) {
      const lcTool = new DynamicStructuredTool({
        name: tool.name,
        description: tool.description,
        schema: tool.schema,
        func: async (args: Record<string, unknown>) => {
          try {
            // Find which server this tool belongs to
            const connections = this.mcpClient.getConnections();
            const serverName = connections.find(conn => 
              conn.tools.some(t => t.name === tool.name)
            )?.name;
            
            if (!serverName) {
              throw new Error(`Could not find server for tool: ${tool.name}`);
            }
            
            // Call the tool via MCP
            const result = await this.mcpClient.callTool(serverName, tool.name, args);
            return JSON.stringify(result);
          } catch (error) {
            console.error(`Error calling tool ${tool.name}:`, error);
            return `Error: ${error instanceof Error ? error.message : String(error)}`;
          }
        }
      });
      
      this.tools.push(lcTool);
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return Array.from(this.models.keys());
  }

  async getAvailableTools(): Promise<string[]> {
    return this.tools.map(tool => tool.name);
  }

  async createNewChat(title: string): Promise<number> {
    return await createChat(title);
  }

  async sendMessage(
    chatId: number,
    message: string,
    modelId: string
  ): Promise<string> {
    // Add user message to database
    await createMessage(chatId, message, "human");
    
    // Get chat history
    const chatHistory = await getMessagesByChatId(chatId);
    const messages = chatHistory.map(msg => 
      msg.role === "human" 
        ? new HumanMessage(msg.content) 
        : new AIMessage(msg.content)
    );
    
    // Get the selected model
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }
    
    // Configure model with tools
    const modelWithTools = model.bind({
      tools: this.tools,
    });
    
    // Process message with model
    const result = await modelWithTools.invoke([
      ...messages,
      new HumanMessage(message)
    ]);
    
    // Handle any tool calls
    if (result.tool_calls) {
      const toolCallsMessages = [];
      
      for (const toolCall of result.tool_calls) {
        try {
          const tool = this.tools.find(t => t.name === toolCall.name);
          if (!tool) {
            throw new Error(`Tool not found: ${toolCall.name}`);
          }
          
          const toolResult = await tool.invoke(toolCall);
          toolCallsMessages.push(toolResult);
        } catch (error) {
          console.error(`Error executing tool call:`, error);
        }
      }
      
      // If there were tool calls, make another call to process the results
      if (toolCallsMessages.length > 0) {
        const finalResult = await modelWithTools.invoke([
          ...messages,
          new HumanMessage(message),
          result,
          ...toolCallsMessages
        ]);
        
        // Save AI response to database
        await createMessage(chatId, finalResult.content as string, "ai");
        return JSON.stringify(finalResult.content);
      }
    }
    
    // Save AI response to database
    await createMessage(chatId, result.content as string, "ai");
    return JSON.stringify(result.content);
  }
}