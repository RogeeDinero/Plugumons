// server-ai.js
import express from "express";
import fetch from "node-fetch"; // install with npm i node-fetch
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint for your front-end to call
app.post("/api/ai", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "No message sent!" });

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: message })
    });

    const data = await response.json();

    // Hugging Face inference API returns an array with 'generated_text'
    const reply = data[0]?.generated_text || "🤖 Plugumon is silent...";
    res.json({ reply });
  } catch (err) {
    console.error("Hugging Face API error:", err);
    res.status(500).json({ reply: "⚡ Error connecting to AI server." });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
