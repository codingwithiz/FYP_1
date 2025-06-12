const sql = require("mssql");

exports.createChat = async (reqBody) => {
   console.log(reqBody);
    const { title, thread_id, userId, conversation } = reqBody;

    const chatId = `chat_${Date.now()}`;
    const transaction = new sql.Transaction();

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        // Insert into Chat table
        await request
            .input("chatId", sql.VarChar, chatId)
            .input("title", sql.VarChar, title)
            .input("thread_id", sql.VarChar, thread_id)
            .input("userId", sql.VarChar, userId).query(`
              INSERT INTO Chat (chatId, title, thread_id, userId, created_at)
              VALUES (@chatId, @title, @thread_id, @userId, GETDATE())
          `);

        // Insert each conversation message with a NEW request per iteration
        for (const { user_prompt, bot_answer } of conversation) {
            const conversationId = `conv_${Date.now()}_${Math.floor(
                Math.random() * 10000
            )}`;
            const convRequest = new sql.Request(transaction);

            await convRequest
                .input("conversationId", sql.VarChar, conversationId)
                .input("chatId", sql.VarChar, chatId)
                .input("user_prompt", sql.Text, user_prompt)
                .input("bot_answer", sql.Text, bot_answer).query(`
                  INSERT INTO Conversation (conversationId, chatId, user_prompt, bot_answer, created_at)
                  VALUES (@conversationId, @chatId, @user_prompt, @bot_answer, GETDATE())
              `);
        }

        await transaction.commit();
        return {
            chatId,
            message: "Chat and conversation(s) created successfully.",
        };
    } catch (err) {
        await transaction.rollback();
        throw new Error("Failed to create chat with conversations: " + err.message);
    }
};

exports.addMessage = async (chatId, user_prompt, bot_answer) => {
    const conversationId = `conv_${Date.now()}_${Math.floor(
        Math.random() * 10000
    )}`;

    try {
        await sql.query`
          INSERT INTO Conversation (conversationId, chatId, user_prompt, bot_answer, created_at)
          VALUES (${conversationId}, ${chatId}, ${user_prompt}, ${bot_answer}, GETDATE())
      `;

        return { conversationId, message: "Message added to conversation." };
    } catch (err) {
        throw new Error("Failed to add message: " + err.message);
    }
};

exports.getChatsByUserId = async (userId) => {
    try {
        const result =
            await sql.query`SELECT * FROM Chat WHERE userId = ${userId}`;
        return result.recordset;
    } catch (err) {
        throw new Error("Failed to retrieve chats: " + err.message);
    }
};

exports.getChatById = async (chatId) => {
    try {
        const result =
            await sql.query`SELECT * FROM Chat WHERE chatId = ${chatId}`;
        return result.recordset[0] || null;
    } catch (err) {
        throw new Error("Failed to retrieve chat: " + err.message);
    }
};

exports.getConversationsByChatId = async (chatId) => {
    try {
        const result = await sql.query`
          SELECT * FROM Conversation WHERE chatId = ${chatId} ORDER BY created_at ASC
      `;
        return result.recordset;
    } catch (err) {
        throw new Error(`Error retrieving conversations: ${err.message}`);
    }
};

exports.updateChat = async (chatId, title) => {
    try {
        await sql.query`UPDATE Chat SET title = ${title} WHERE chatId = ${chatId}`;
        return { message: "Chat updated" };
    } catch (err) {
        throw new Error("Failed to update chat: " + err.message);
    }
};

exports.deleteChat = async (chatId) => {
    try {
        await sql.query`DELETE FROM Conversation WHERE chatId = ${chatId}`;
        await sql.query`DELETE FROM Chat WHERE chatId = ${chatId}`;
        return { message: "Chat and conversations deleted" };
    } catch (err) {
        throw new Error("Failed to delete chat: " + err.message);
    }
};
