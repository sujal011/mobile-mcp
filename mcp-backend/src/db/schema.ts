import { sql } from "drizzle-orm";
import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const chatTable = pgTable("chat_table", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({length: 255}).notNull(),
    createdAt: varchar({length: 255}).default(sql`CURRENT_TIMESTAMP`),
});

export const messageTable = pgTable("message_table", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    chatId: integer("chat_id").references(() => chatTable.id,{onDelete:'cascade'}).notNull(),
    content: text().notNull(),
    role: varchar({length: 255}).notNull().$type<"human" | "ai" | "tool" | "system">(),
    createdAt: varchar({length: 255}).default(sql`CURRENT_TIMESTAMP`),
})
