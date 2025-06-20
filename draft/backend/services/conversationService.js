const sql = require("mssql");

exports.getConversations = async (chatId) => {
    try {
        const result = await sql.query`SELECT * FROM Conversation WHERE chatId = ${chatId}`;
        return result.recordset;
    } catch (err) {
        throw new Error(`Error fetching conversations: ${err.message}`);
    }
};

exports.addConversation = async (chatId, user_prompt, bot_answer) => {
    const conversationId = `conv_${Date.now()}`;
    try {
        await sql.query`INSERT INTO Conversation (conversationId, chatId, user_prompt, bot_answer, created_at) VALUES (${conversationId}, ${chatId}, ${user_prompt}, ${bot_answer}, GETDATE())`;
        return { conversationId };
    } catch (err) {
        throw new Error(`Error adding conversation: ${err.message}`);
    }
};

exports.updateAnalysisId = async (conversationId, analysisId) => {
    try {
        await sql.query`
            UPDATE Conversation
            SET analysisId = ${analysisId}
            WHERE conversationId = ${conversationId}
        `;
    } catch (err) {
        throw new Error(`Error updating analysisId: ${err.message}`);
    }
};
