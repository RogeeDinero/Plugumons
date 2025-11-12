import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // make sure node-fetch is installed
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/ai", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "⚡ No message provided." });

  try {
    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/Plugumons/PlugumonsAI",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: message,
          options: { wait_for_model: true }
        })
      }
    );

    if (!hfResponse.ok) {
      console.error("Hugging Face API error:", hfResponse.status, hfResponse.statusText);
      return res.json({ reply: `⚡ Hugging Face error: ${hfResponse.status} ${hfResponse.statusText}` });
    }

    const data = await hfResponse.json();

    // Hugging Face returns an array of outputs for text generation
    const reply = Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text
      : "🤖 Plugumon is silent...";

    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.json({ reply: "⚡ Error connecting to Hugging Face." });
  }
});

app.listen(PORT, () => {
  console.log(`Plugumons AI server running on port ${PORT}`);
});

