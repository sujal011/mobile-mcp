import express from "express";
import { createChat, getAllChats, getMessagesByChatId } from "../controllers/chatController";

const router = express.Router();

router.post("/chats", createChat);
router.get("/chats", getAllChats);
router.get("/chats/:chatId/messages", getMessagesByChatId);

export { router as chatRoute };