import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// HuggingFace Inference API (correct domain!)
const HF_MODEL = "gpt2";
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const HF_KEY = process.env.HUGGINGFACE_API_KEY;

// Validate token
if (!HF_KEY) {
  console.error("HUGGINGFACE_API_KEY is missing in .env");
  process.exit(1);
}

app.post("/api/ai", async (req, res) => {
  try {
    const userMessage = req.body.message?.trim();
    if (!userMessage) return res.json({ reply: "Send a message!" });

    console.log("Incoming:", userMessage);

    const hfResponse = await fetch(HF_URL, {
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

    const raw = await hfResponse.text();
    console.log("HF RAW RESPONSE:", raw);

    if (!hfResponse.ok) {
      console.error("HF Error:", hfResponse.status, raw);
      return res.json({ reply: `HF error ${hfResponse.status}` });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return res.json({ reply: "Failed to parse AI response." });
    }

    if (data.error) {
      return res.json({ reply: `Model error: ${data.error}` });
    }

    // GPT-2 returns: [ { generated_text: "..." } ]
    const reply = data[0]?.generated_text?.trim() || "No reply.";
    console.log("AI Reply:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.json({ reply: "Server error. Try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Plugumons AI server running on port ${PORT}`);
});
