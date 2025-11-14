import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Fun default replies if API fails
const defaultReplies = [
  "⚡ Plugumon is charging... Try again!",
  "🤖 Plugumon is sleepy, come back in a sec!",
  "⚡ I short-circuited! Ask me something else.",
  "🔌 Zap! I didn’t catch that, try again.",
  "🤖 Plugumon is thinking really hard... almost done!"
];

// Helper to pick a random default reply
function getRandomReply() {
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}

// AI endpoint
app.post("/api/ai", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "🤖 Send me a message first!" });

  console.log("📩 Incoming:", message);

  try {
    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/PlugumonsAI/PlugumonAI",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: message })
      }
    );

    console.log("📤 HF Status:", hfResponse.status, hfResponse.statusText);

    const rawText = await hfResponse.text();
    console.log("🔍 HF RAW RESPONSE:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Failed to parse HF JSON:", err);
      const fallback = getRandomReply();
      console.log("🛡 Using fallback reply:", fallback);
      return res.json({ reply: fallback });
    }

    let reply;
    if (data.error) {
      console.error("⚡ Hugging Face returned error:", data.error);
      reply = getRandomReply();
      console.log("🛡 Using fallback reply:", reply);
    } else if (Array.isArray(data)) {
      reply = data[0]?.generated_text || getRandomReply();
    } else {
      reply = data.generated_text || getRandomReply();
    }

    console.log("✅ Reply:", reply);
    res.json({ reply });

  } catch (err) {
    console.error("⚡ Hugging Face API fetch error:", err);
    const fallback = getRandomReply();
    console.log("🛡 Using fallback reply due to fetch error:", fallback);
    res.json({ reply: fallback });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Plugumons AI server running on port ${PORT}`));
