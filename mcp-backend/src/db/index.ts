import { open } from "sqlite";
import sqlite3Offline from 'sqlite3-offline-next'

const initDb = async () => {
  const db = await open({
    filename: "database.db",
    driver: sqlite3Offline.Database,
  });

  // Create `chat_table` if it does not exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create `message_table` if it does not exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatId INTEGER NOT NULL,
      content TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('human', 'ai', 'tool', 'system')),
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chatId) REFERENCES chat_table(id) ON DELETE CASCADE
    )
  `);

  console.log("Database initialized and tables ensured.");
};

export { initDb };