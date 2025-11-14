// server-ai.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/api/ai", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "🤖 Send me a message first!" });

  console.log("📩 Incoming:", message);

  try {
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/PlugumonsAI/PlugumonAI",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: message })
      }
    );

    // Log HTTP status for debugging
    console.log("🔍 HF Status:", hfResponse.status, hfResponse.statusText);

    const rawText = await hfResponse.text();
    console.log("🔍 HF RAW RESPONSE:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Failed to parse HF JSON:", err);
      return res.json({ reply: "⚡ Failed to parse Hugging Face response." });
    }

    let reply;
    if (data.error) {
      reply = `⚡ Hugging Face API error: ${data.error}`;
    } else if (Array.isArray(data)) {
      reply = data[0]?.generated_text || "🤖 Plugumon is silent...";
    } else {
      reply = data.generated_text || "🤖 Plugumon is silent...";
    }

    res.json({ reply });
  } catch (err) {
    console.error("⚡ Error connecting to Hugging Face API:", err);
    res.json({ reply: "⚡ Error connecting to AI server." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Plugumons AI server running on port ${PORT}`));
