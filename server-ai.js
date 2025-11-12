// server-ai.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// AI endpoint
app.post("/api/ai", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ reply: "No message provided." });

  try {
    // Hugging Face inference endpoint (router endpoint)
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/hf-inference/PlugumonsAI",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: message,
          parameters: { max_new_tokens: 150 } // optional: limit response length
        }),
      }
    );

    // Check if Hugging Face returned an error
    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      console.error("Hugging Face API error:", hfResponse.status, errText);
      return res.status(500).json({ reply: `⚡ Hugging Face error: ${hfResponse.status}` });
    }

    const data = await hfResponse.json();

    // Hugging Face may return text in different formats depending on model type
    // For text-generation models:
    const reply = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : "🤖 Plugumon is silent...";
    
    res.json({ reply });
  } catch (err) {
    console.error("Server AI error:", err);
    res.status(500).json({ reply: "⚡ Error connecting to AI server." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Plugumons AI server running on port ${PORT}`);
  console.log(`Available at: http://localhost:${PORT}/api/ai`);
});
