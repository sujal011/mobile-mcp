import express, { Router } from "express";
import { createChat, createMessage, getAllChats, getMessagesByChatId } from "../controllers/chatController.js";

const router: Router = express.Router();

router.post("/chats", createChat);
router.get("/chats", getAllChats);
router.post("/chats/messages", createMessage);
router.get("/chats/:chatId/messages", getMessagesByChatId);

export { router as chatRoute };