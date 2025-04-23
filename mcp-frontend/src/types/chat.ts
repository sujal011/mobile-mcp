
export interface ChatMessage {
  id: number;
  chatId: number;
  content: string;
  role: 'human' | 'ai' | 'tool';
  createdAt: string;
}

export interface Chat {
  id: number;
  title: string;
}

export interface McpConfig {
  mcpServers: {
    [key: string]: {
      command: string;
      args: string[];
      env: Record<string, string>;
      disabled: boolean;
      autoApprove: string[];
    };
  };
}
