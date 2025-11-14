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
const HF_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;
const HF_KEY = process.env.HUGGINGFACE_API_KEY;

// ====== API ROUTE ======
app.post("/api/ai", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    console.log("📩 Incoming:", userMessage);

    // HF Request
    const hfResponse = await fetch(HF_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: userMessage,
        parameters: { max_new_tokens: 120 },
      }),
    });

    const raw = await hfResponse.text();
    console.log("🔍 HF RAW RESPONSE:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("❌ Failed to parse HF JSON:", err);
      return res.json({
        reply: "⚡ Agent Plug had trouble reading the response.",
      });
    }

    if (data.error) {
      console.error("❌ HuggingFace API error:", data.error);
      return res.json({ reply: "⚡ Model error: " + data.error });
    }

    // HF text models respond differently — this handles both formats
    const reply =
      Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    const finalReply = reply || "⚡ No response from Plugumon model.";

    console.log("🤖 AI Reply:", finalReply);
    res.json({ reply: finalReply });
  } catch (err) {
    console.error("🔥 SERVER ERROR:", err);
    res.json({ reply: "⚡ Server error connecting to Plugumons AI." });
  }
});

// ====== START SERVER ======
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Plugumons AI server running on port ${PORT}`);
});
