// server-ai.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ----------------- CORS Setup -----------------
// You can restrict to your front-end domain if you want
app.use(cors({
  origin: "*" // <-- change to your front-end URL in production
}));

// Parse JSON bodies
app.use(express.json());

// ----------------- AI Proxy Endpoint -----------------
app.post("/api/ai", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/nistral/Nistral-7B",
      { inputs: `You are Agent Plug, a playful electric ghost from Plugumon World.\nUser: ${userMessage}\nPlug:` },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Return the AI's generated reply
    const reply = response.data?.[0]?.generated_text?.split("Plug:")?.pop()?.trim() || "🤖 Plugumon is silent...";
    res.json({ reply });
  } catch (error) {
    console.error("HF API error:", error.message);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
});

// ----------------- Start Server -----------------
app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});
