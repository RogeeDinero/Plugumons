// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const HF_API_KEY = process.env.HF_API_KEY;

app.post("/api/ai", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/PlugumonsAI/PlugumonAI", 
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: message })
      }
    );

    const text = await hfResponse.text();

    console.log("🔍 HF RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        reply: "⚡ HF returned a non-JSON response.",
        raw: text
      });
    }

    if (!hfResponse.ok) {
      console.error("❌ Hugging Face API error:", data);
      return res.status(500).json({
        reply: "⚡ AI server error.",
        details: data
      });
    }

    const reply = data?.generated_text || "🤖 Plugumon said nothing.";
    res.json({ reply });

  } catch (err) {
    console.error("🔥 Server ERROR:", err);
    res.status(500).json({ reply: "⚡ Error connecting to AI server." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Plugumons AI server running on port ${PORT}`);
});

