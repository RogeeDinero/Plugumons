import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// POST /api/ai endpoint
app.post("/api/ai", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "⚡ No message provided." });
  }

  try {
    const hfResponse = await fetch(
      "https://router.huggingface.co/api-inference/PlugumonsAI/PlugumonAI",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: message })
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("Hugging Face API error:", hfResponse.status, errorText);
      return res.status(hfResponse.status).json({ reply: `⚡ Hugging Face error: ${hfResponse.status} ${hfResponse.statusText}` });
    }

    const data = await hfResponse.json();

    // Hugging Face inference API can return array or object depending on model
    let reply = "🤖 Plugumon is silent...";
    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } else if (data.generated_text) {
      reply = data.generated_text;
    }

    res.json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ reply: "⚡ Error connecting to Hugging Face server." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Plugumons AI server running on port ${PORT}`);
});
