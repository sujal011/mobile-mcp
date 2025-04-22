import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const chatTable = sqliteTable("chat_table", {
    id: int().primaryKey({ autoIncrement: true }),
    title: text().notNull(),

});

export const messageTable = sqliteTable("message_table", {
    id: int().primaryKey({ autoIncrement: true }),
    chatId: int("cha_Id").references(() => chatTable.id),
    content: text().notNull(),
    role: text().notNull(),
})
