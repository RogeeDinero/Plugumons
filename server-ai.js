import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/api/ai", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message provided." });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Plugumons/PlugumonsAI",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: message })
      }
    );

    const data = await response.json();

    // Hugging Face sometimes returns an array of text completions
    const reply = Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text
      : data.error
        ? `⚡ Hugging Face error: ${data.error}`
        : "🤖 Plugumon is silent...";

    res.json({ reply });
  } catch (err) {
    console.error("AI server error:", err);
    res.status(500).json({ reply: "⚡ Error connecting to AI server." });
  }
});

app.listen(PORT, () => {
  console.log(`Agent Plug AI server running on port ${PORT}`);
});

