import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { chatTable, messageTable } from "../db/schema.js";

export const createChat = async(title: string) => {
    const result = await db.insert(chatTable).values({ title }).returning({id:chatTable.id,title:chatTable.title})
    if (result.length === 0) {
        throw new Error("Failed to create chat")
    }
    return result
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