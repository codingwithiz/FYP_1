// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatService = require("../services/chatService");


// Create a new chat
/*
{
  "title": "Startup Chat",
  "thread_id": "thread_56789",
  "userId": "user_002",
  "conversation": [
    {
      "user_prompt": "What are some good business ideas for students?",
      "bot_answer": "You could start a campus food delivery app, a tutoring service, or a study tool."
    },
    {
      "user_prompt": "How to validate a business idea?",
      "bot_answer": "You can start by creating an MVP, talking to potential customers, and getting feedback."
    }
  ]
}
  */
router.post("/", async (req, res) => {
    
    const chat = await chatService.createChat(req.body);
    res.json(chat);
});

/*
{
  "chatId": "chat_1749717843666",
  "user_prompt": "What's the capital of France?",
  "bot_answer": "Paris"
}
*/
router.put("/:chatId/messages", async (req, res) => {
    const { chatId } = req.params;
    const { user_prompt, bot_answer } = req.body;

    try {
        const updatedChat = await chatService.addMessage(chatId, user_prompt, bot_answer);
        res.json(updatedChat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get all chats for a user
router.get("/:userId", async (req, res) => {
    const chats = await chatService.getChatsByUserId(req.params.userId);
    res.json(chats);
});

// Get a chat by ID
router.get("/:chatId", async (req, res) => {
    const chat = await chatService.getChatById(req.params.chatId);
    res.json(chat);
});

// Get all conversations for a chat
router.get('/:chatId/conversations', async (req, res) => {
    const { chatId } = req.params;
    try {
        const conversations = await chatService.getConversationsByChatId(chatId);
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
);

// Update a chat's title
router.patch("/:chatId", async (req, res) => {
    const updated = await chatService.updateChatTitle(
        req.params.chatId,
        req.body.title
    );
    res.json(updated);
});

// Delete a chat and its conversations
router.delete("/:chatId", async (req, res) => {
    await chatService.deleteChat(req.params.chatId);
    res.status(204).send();
});


module.exports = router;
