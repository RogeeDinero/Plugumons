import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PYTHON_SERVER_URL = "http://127.0.0.1:5000/api/ai";

app.post("/api/ai", async (req, res) => {
  try {
    const userMessage = req.body.message?.trim();
    if (!userMessage) return res.json({ reply: "Send a message first!" });

    const response = await fetch(PYTHON_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();
    res.json({ reply: data.reply });
  } catch (err) {
    console.error("Server error:", err);
    res.json({ reply: "AI service unavailable. Try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Node server running on ${PORT}`));

