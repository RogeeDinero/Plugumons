import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/api/ai", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "🤖 Send me a message first!" });

  try {
    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/PlugumonsAI/PlugumonAI",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: message })
      }
    );

    const data = await hfResponse.json();

    // Hugging Face returns different formats; handle text output
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
    console.error("Hugging Face API fetch error:", err);
    res.json({ reply: "⚡ Error connecting to AI server." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Plugumons AI server running on port ${PORT}`)
);
