import express from "express";
import { chatRoute } from "./routes/chatRoute.js";
import { ChatService } from "./services/chat-service.js";
import * as path from "path";
const app = express();

app.use(express.json());

export const chatService = new ChatService(
    [
        {
            provider: "openai",
            modelName: "gpt-4o",
            apiKey: process.env.OPENAI_API_KEY || "",
        },
        {
            provider: "anthropic",
            modelName: "claude-3-5-sonnet",
            apiKey: process.env.ANTHROPIC_API_KEY || "",
        },
        {
            provider: "groq",
            modelName: "llama3-8b-8192",
            apiKey: process.env.GROQ_API_KEY || "",
        },
        {
            provider:"gemini",
            modelName: "gemini-2.0-flash",
            apiKey: process.env.GEMINI_API_KEY || "",
        }
    ],
    path.join(process.cwd(), "mcpconfig.json")
);
(async () => {
    try {
        await chatService.initialize();
        console.log("Chat service initialized");
    } catch (error) {
        console.error("Failed to initialize chat service:", error);
        process.exit(1);
    }
})();

app.get("/api/models", async (req, res) => {
    try {
      const models = await chatService.getAvailableModels();
      res.json({ models });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
app.get("/api/tools", async (req, res) => {
    try {
      const tools = await chatService.getAvailableTools();
      res.json({ tools });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

app.use("/api", chatRoute);

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

// Handle process shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    process.exit(0);
  });