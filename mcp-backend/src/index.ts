import express from "express";
import { chatRoute } from "./routes/chatRoute.js";

const app = express();

app.use(express.json());
app.use("/api", chatRoute);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});