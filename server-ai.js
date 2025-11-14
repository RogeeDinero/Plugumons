// server-ai.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// HuggingFace model and new router URL
const HF_MODEL = "distilgpt2"; // you can change to another model
const HF_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;
const HF_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HF_KEY) {
  console.error("HUGGINGFACE_API_KEY missing!");
  process.exit(1);
}

app.post("/api/ai", async (req, res) => {
  const userMessage = req.body.message?.trim();
  if (!userMessage) return res.json({ reply: "Send a message first!" });

  try {
    const response = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: userMessage,
        parameters: { max_new_tokens: 120 },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("HuggingFace error:", response.status, text);
      return res.json({ reply: `AI error: ${response.status}` });
    }

    const data = await response.json();
    // HuggingFace router returns an array with generated_text
    const reply = Array.isArray(data)
      ? data[0]?.generated_text?.trim()
      : data.generated_text?.trim();

    res.json({ reply: reply || "🤖 Plugumon is silent..." });

  } catch (err) {
    console.error("Server error:", err);
    res.json({ reply: "⚡ AI service unavailable. Try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Node AI server running on ${PORT}`));
