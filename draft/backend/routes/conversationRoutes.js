const express = require("express");
const router = express.Router({ mergeParams: true });
const conversationService = require("../services/conversationService");

// Get conversations for a chat
router.get("/:chatId", async (req, res) => {
    const { chatId } = req.params;
    try {
        const conversations = await conversationService.getConversations(
            chatId
        );
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new conversation
router.post("/:chatId", async (req, res) => {
    const { chatId } = req.params;
    const { user_prompt, bot_answer } = req.body;
    try {
        const conversation = await conversationService.addConversation(
            chatId,
            user_prompt,
            bot_answer
        );
        res.status(201).json(conversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
