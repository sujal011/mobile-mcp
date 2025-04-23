import { open } from "sqlite";
import sqlite3Offline from 'sqlite3-offline-next'
const dbPromise = open({
  filename: "database.db",
  driver: sqlite3Offline.Database,
});

export const createChat = async (title: string) => {
  const db = await dbPromise;
  const result = await db.run('INSERT INTO chats (title) VALUES (?)', title);
  if (result.changes === 0) {
    throw new Error("Failed to create chat");
  }
  return result.lastID;
};

export const getAllChats = async () => {
  const db = await dbPromise;
  const result = await db.all('SELECT * FROM chats');
  if (!result || result.length === 0) {
    throw new Error("No chats found");
  }
  return result;
};

export const createMessage = async (
  chatId: number,
  content: string,
  role: "human" | "ai" | "tool" | "system"
) => {
  const db = await dbPromise;
  const result = await db.run(
    'INSERT INTO messages (chatId, content, role) VALUES (?, ?, ?)',
    chatId,
    content,
    role
  );
  if (result.changes === 0) {
    throw new Error("Failed to create message");
  }
  return result.lastID;
};

export const getChatById = async (chatId: number) => {
  const db = await dbPromise;
  const result = await db.get('SELECT * FROM chats WHERE id = ?', chatId);
  if (!result) {
    throw new Error("No chat found with this ID");
  }
  return result;
};

export const getMessagesByChatId = async (chatId: number) => {
  const db = await dbPromise;
  const result = await db.all('SELECT * FROM messages WHERE chatId = ?', chatId);
  if (!result || result.length === 0) {
    throw new Error("No messages found for this chat");
  }
  return result;
};