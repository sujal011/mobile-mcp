import type { Request, Response } from "express";
import * as chatServiceImpl from "../services/chatService.js";
import { ChatService } from "../services/chat-service.js";
import { chatService } from "../index.js";

export async function createChat(req: Request, res: Response) : Promise<any> {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, error: "Title is required" });
        }
        const chat = await chatServiceImpl.createChat(title);
        if(!chat) {
            return res.status(500).json({ success: false, error: "Failed to create chat" });
        }
        return res.status(201).json({ success: true, data: {message: "New Chat Created Successfully"} });
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export async function getAllChats(req: Request, res: Response): Promise<any> {
    try {
        const chats = await chatServiceImpl.getAllChats();
        res.status(200).json({ success: true, data: chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export async function createMessage(req: Request, res: Response): Promise<any> {
    try {
        const { chatId, content, modelId } = req.body;
        if (!chatId || !content || !modelId) {
            return res.status(400).json({ success: false, error: "Chat ID, content and model Id are required" });
        }
        const chat = await chatServiceImpl.getChatById(chatId);
        if(!chat) {
            return res.status(404).json({ success: false, error: "Chat not found" });
        }
        const response = await chatService.sendMessage(chatId, content, modelId);
        if(!response) {
            return res.status(500).json({ success: false, error: "Failed to create message" });
        }
        const messages = await chatServiceImpl.getMessagesByChatId(chatId);

        return res.status(201).json({ 
      response,
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt
      }))
    });
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export async function getMessagesByChatId(req: Request, res: Response): Promise<any> {
    try {
        const chatId = parseInt(req.params.chatId!, 10);
        if (isNaN(chatId)) {
            return res.status(400).json({ success: false, error: "Invalid chat ID" });
        }
        const messages = await chatServiceImpl.getMessagesByChatId(chatId);
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}
