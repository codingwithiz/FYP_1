// routes/chatbot.js
const express = require("express");
const router = express.Router();
const { askChatbot } = require("../services/openaiService");

router.post("/api/chatbot", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const reply = await askChatbot(message);

    // Extract JSON from code block if present
    let jsonString = reply;
    const match = reply.match(/```json\s*([\s\S]*?)\s*```/i);
    if (match) {
      jsonString = match[1];
    }

    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse JSON from chatbot response" });
    }

    res.json(data);
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "OpenAI API failed" });
  }
});

module.exports = router;
