import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const chatTable = sqliteTable("chat_table", {
    id: int().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    createdAt: text().default(sql`CURRENT_TIMESTAMP`),
});

export const messageTable = sqliteTable("message_table", {
    id: int().primaryKey({ autoIncrement: true }),
    chatId: int("chat_id").references(() => chatTable.id,{onDelete:'cascade'}).notNull(),
    content: text().notNull(),
    role: text().notNull().$type<"human" | "ai" | "tool" | "system">(),
    createdAt: text().default(sql`CURRENT_TIMESTAMP`),
})
