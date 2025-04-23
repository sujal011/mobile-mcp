
import axios from 'axios';
import type { McpConfig } from '../types/chat';

const baseURL = 'http://localhost:3000/api';
const api = axios.create({ baseURL });

export const getChats = async () => {
  const response = await api.get('/chats');
  return response.data.data;
};

export const createChat = async (title: string) => {
  const response = await api.post('/chats', { title });
  return response.data;
};

export const getTools = async () => {
  const response = await api.get('/tools');
  return response.data.models;
};

export const getModels = async () => {
  const response = await api.get('/models');
  return response.data.models;
};

export const getMcpConfig = async (): Promise<{ configFile: McpConfig }> => {
  const response = await api.get('/mcpconfig');
  return response.data;
};

export const updateMcpConfig = async (configFile: McpConfig) => {
  const response = await api.post('/mcpconfig', { configFile });
  return response.data;
};

export const sendMessage = async (chatId: number, content: string, modelId: string) => {
  const response = await api.post('/chats/messages', { chatId, content, modelId });
  return response.data;
};

export const getChatMessages = async (chatId: number) => {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data.data;
};
