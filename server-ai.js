import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Plugumons AI Server is running ⚡");
});

app.post("/api/ai", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "⚡ No message provided!" });
  }

  try {
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/PlugumonsAI/PlugumonAI",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: message }),
      }
    );

    if (!hfResponse.ok) {
      console.error("Hugging Face API error:", hfResponse.status, hfResponse.statusText);
      return res.status(500).json({ reply: `⚡ Hugging Face error: ${hfResponse.status} ${hfResponse.statusText}` });
    }

    const data = await hfResponse.json();

    // The HF response may vary depending on your model; adjust if necessary
    const replyText = data?.[0]?.generated_text || data?.generated_text || "🤖 Plugumon is silent...";
    
    res.json({ reply: replyText });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ reply: "⚡ Error connecting to Hugging Face AI." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Plugumons AI server running on port ${PORT}`);
  console.log(`Available at your primary URL http://localhost:${PORT}`);
});
