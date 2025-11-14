import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ====== HuggingFace Model Info ======
const HF_MODEL = "PlugumonsAI/PlugumonAI";

// Use the direct model endpoint (works for private & public)
const HF_URL = `https://api.huggingface.co/models/${HF_MODEL}`;
const HF_KEY = process.env.HUGGINGFACE_API_KEY;

// ====== API ROUTE ======
app.post("/api/ai", async (req, res) => {
  const userMessage = req.body.message?.trim();
  if (!userMessage) return res.json({ reply: "Send me a message first!" });

  console.log("Incoming:", userMessage);

  try {
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

    // ---- DEBUG: log status & headers ----
    console.log("HF status:", hfResponse.status);
    // -------------------------------------

    if (!hfResponse.ok) {
      const txt = await hfResponse.text();
      console.error("HF non-200:", txt);
      return res.json({ reply: `HF error ${hfResponse.status}: ${txt}` });
    }

    const raw = await hfResponse.text();
    console.log("HF RAW RESPONSE:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse HF JSON:", err);
      return res.json({ reply: "Agent had trouble reading the response." });
    }

    if (data.error) {
      console.error("Hugging Face API error:", data.error);
      return res.json({ reply: `HF error: ${data.error}` });
    }

    const reply =
      Array.isArray(data)
        ? data[0]?.generated_text?.trim()
        : data.generated_text?.trim() || "No response from model.";

    console.log("AI Reply:", reply);
    res.json({ reply });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.json({ reply: "Server error connecting to Plugumons AI." });
  }
});

// ====== START SERVER ======
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Plugumons AI server running on port ${PORT}`);
});
