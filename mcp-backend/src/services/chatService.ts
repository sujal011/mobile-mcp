import { eq } from "drizzle-orm";
import { db } from "../db";
import { chatTable, messageTable } from "../db/schema";

export const createChat = async(title: string) => {
    const result = await db.insert(chatTable).values({ title }).returning()
    return result
}

export const getAllChats = async() => {
    const result = await db.select().from(chatTable)
    return result
}

export const getMessagesByChatId = async(chatId: number) => {
    const result = await db.select().from(messageTable).where(eq(messageTable.chatId,chatId))
    return result
}