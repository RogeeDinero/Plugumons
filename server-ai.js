app.post("/api/ai", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "🤖 Send me a message first!" });

  try {
    console.log("📩 Incoming:", message);

    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/PlugumonsAI/PlugumonAI",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: message }),
      }
    );

    console.log("🔍 HF RESPONSE STATUS:", hfResponse.status);

    const text = await hfResponse.text(); // temporarily read as text to debug
    console.log("🔍 HF RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Failed to parse HF JSON:", err);
      return res.json({ reply: "⚡ Hugging Face returned invalid JSON." });
    }

    let reply;
    if (data.error) {
      reply = `⚡ Hugging Face API error: ${data.error}`;
    } else if (Array.isArray(data)) {
      reply = data[0]?.generated_text || "🤖 Plugumon is silent...";
    } else {
      reply = data.generated_text || "🤖 Plugumon is silent...";
    }

    res.json({ reply });
  } catch (err) {
    console.error("Hugging Face API fetch error:", err);
    res.json({ reply: "⚡ Error connecting to AI server." });
  }
});
