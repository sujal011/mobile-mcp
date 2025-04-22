import type { Request, Response } from "express";
import * as chatService from "../services/chatService.js";


export async function createChat(req: Request, res: Response) : Promise<any> {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, error: "Title is required" });
        }
        const chat = await chatService.createChat(title);
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
        const chats = await chatService.getAllChats();
        res.status(200).json({ success: true, data: chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export async function createMessage(req: Request, res: Response): Promise<any> {
    try {
        const { chatId, content, role } = req.body;
        if (!chatId || !content || !role) {
            return res.status(400).json({ success: false, error: "Chat ID, content and role are required" });
        }
        const message = await chatService.createMessage(chatId, content, role);
        if(!message) {
            return res.status(500).json({ success: false, error: "Failed to create message" });
        }
        return res.status(201).json({ success: true, data: {message: "New Message Created Successfully"} });
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
        const messages = await chatService.getMessagesByChatId(chatId);
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}
