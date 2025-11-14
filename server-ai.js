// server-ai.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// === CONFIG ===
const USE_INFERENCE_ENDPOINT = process.env.USE_INFERENCE_ENDPOINT === "true";

// TEST: Use distilgpt2 (works reliably)
const TEST_MODEL = "distilgpt2";
const TEST_URL = `https://router.huggingface.co/hf-inference/models/${TEST_MODEL}`;

// PROD: Your model later
const PROD_URL = process.env.HF_ENDPOINT_URL;

const HF_URL = USE_INFERENCE_ENDPOINT ? PROD_URL : TEST_URL;
const HF_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HF_KEY) {
  console.error("HUGGINGFACE_API_KEY missing!");
  process.exit(1);
}

if (USE_INFERENCE_ENDPOINT && !PROD_URL) {
  console.error("HF_ENDPOINT_URL missing but USE_INFERENCE_ENDPOINT=true");
  process.exit(1);
}

app.post("/api/ai", async (req, res) => {
  const userMessage = req.body.message?.trim();
  if (!userMessage) {
    return res.json({ reply: "Send a message first!" });
  }

  console.log("Incoming:", userMessage);
  console.log("Using URL:", HF_URL);  // ← DEBUG LOG

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

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
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const raw = await response.text();
    console.log("HF RAW RESPONSE:", raw.substring(0, 500));

    if (!response.ok) {
      console.error("HF Error:", response.status, raw);
      return res.json({ reply: `AI error: ${response.status} - ${raw}` });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("JSON parse failed:", err);
      return res.json({ reply: "AI response was invalid." });
    }

    if (data.error) {
      console.error("Model error:", data.error);
      return res.json({ reply: `Model error: ${data.error}` });
    }

    const reply = Array.isArray(data)
      ? data[0]?.generated_text?.trim()
      : data.generated_text?.trim();

    if (!reply) {
      return res.json({ reply: "No response from model." });
    }

    console.log("AI Reply:", reply);
    res.json({ reply });
  } catch (err) {
    console.error("SERVER ERROR:", err.message);
    res.json({ reply: "AI service unavailable. Try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Server on ${PORT}`);
  console.log(`Mode: ${USE_INFERENCE_ENDPOINT ? "PROD" : "TEST"}`);
});
