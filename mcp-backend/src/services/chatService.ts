import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { chatTable, messageTable } from "../db/schema.js";

export const createChat = async(title: string) => {
    
    const rowsAffected =  (await db.insert(chatTable).values({ title:title })).rowCount
    if (rowsAffected === 0) {
        throw new Error("Failed to create chat")
    }
    return rowsAffected;
}

export const getAllChats = async() => {
    const result = await db.select().from(chatTable)
    if(!result) {
        throw new Error("Failed to fetch chats")
    }
    if (result.length === 0) {
        throw new Error("No chats found")
    }
    return result
}

export const createMessage = async(chatId: number, content: string, role: "human" | "ai" | "tool" | "system") => {
    const rowsAffected = (await db.insert(messageTable).values({ chatId: chatId, content: content, role: role })).rowCount
    if (rowsAffected === 0) {
        throw new Error("Failed to create message")
    }
    return rowsAffected;
}

export const getChatById = async(chatId: number) => {
    const result = await db.select().from(chatTable).where(eq(chatTable.id,chatId))
    if(!result) {
        throw new Error("Failed to fetch chat")
    }
    if (result.length === 0) {
        throw new Error("No chat found with this ID")
    }
    return result[0]
}


export const getMessagesByChatId = async(chatId: number) => {
    const result = await db.select().from(messageTable).where(eq(messageTable.chatId,chatId))
    if(!result) {
        throw new Error("Failed to fetch messages")
    }
    if (result.length === 0) {
        throw new Error("No messages found for this chat")
    }
    return result
}