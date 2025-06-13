import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // <-- import
import MapViewComponent from "./MapView";

const API = "http://localhost:3001";

function Chatbot({ onExtracted }) {
  const { user } = useAuth(); // <-- get user from context
  const userId = user?.uid;   // <-- use Firebase UID

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [recommendedPlace, setRecommendedPlace] = useState(null);

  // Fetch all chats for user
  useEffect(() => {
    if (userId) fetchChats();
  }, [userId]);

  const fetchChats = async () => {
    if (!userId) return;
    const res = await axios.get(`${API}/chats/${userId}`);
    setChats(res.data);
  };

  // Fetch conversation for a chat
  const fetchConversation = async (chatId) => {
    const res = await axios.get(`${API}/chats/${chatId}/conversations`);
    setConversation(res.data);
    setSelectedChat(chatId);
  };

  // Create a new chat
  const handleCreateChat = async () => {
    if (!newChatTitle.trim()) return;
    const res = await axios.post(`${API}/chats`, {
      title: newChatTitle,
      thread_id: `thread_${Date.now()}`,
      userId,
      conversation: [],
    });
    setNewChatTitle("");
    fetchChats();
    setSelectedChat(res.data.chatId);
    setConversation([]);
  };

  // Delete a chat
  const handleDeleteChat = async (chatId) => {
    await axios.delete(`${API}/chats/${chatId}`);
    fetchChats();
    setSelectedChat(null);
    setConversation([]);
  };

  // Send a message (add to conversation)
  const handleSend = async () => {
    if (!input.trim() || !selectedChat) return;
    setLoading(true);
    try {
      // 1. Get bot answer from chatbot API
      const res = await axios.post(`${API}/api/chatbot`, { message: input });
      const botResult = res.data;

      // 2. Save conversation to chat
      await axios.put(`${API}/chats/${selectedChat}/messages`, {
        user_prompt: input,
        bot_answer: JSON.stringify(botResult),
      });

      // 3. Pass botResult to parent for suitability analysis
      if (onExtracted && (botResult.location || botResult.nearbyMe) && botResult.category) {
        onExtracted({
          location: botResult.location,
          category: botResult.category,
          radius: botResult.radius || 1000,
          nearbyMe: botResult.nearbyMe || false,
        });
      }

      fetchConversation(selectedChat);
      setInput("");
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userId) {
        try {
          const res = await axios.get(`${API}/users/${userId}`);
          setUserInfo(res.data); // { userId, name, preferenceId }
        } catch (err) {
          setUserInfo(null);
        }
      }
    };
    fetchUserInfo();
  }, [userId]);

  // Optionally, show a loading or login message if user is not ready
  if (!userId) {
    return <div>Please log in to use the chatbot.</div>;
  }

  return (
    <div style={{ display: "flex", height: 500, border: "1px solid #ccc" }}>
      {/* Sidebar: Chat List */}
      <div style={{ width: 220, borderRight: "1px solid #ccc", padding: 8 }}>
        <h4>Past Chats</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {chats.map((chat) => (
            <li
              key={chat.chatId}
              style={{
                background: selectedChat === chat.chatId ? "#eee" : "transparent",
                marginBottom: 4,
                padding: 4,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span onClick={() => fetchConversation(chat.chatId)}>{chat.title}</span>
              <button
                style={{ marginLeft: 8, color: "red" }}
                onClick={() => handleDeleteChat(chat.chatId)}
              >
                X
              </button>
            </li>
          ))}
        </ul>
        <input
          value={newChatTitle}
          onChange={(e) => setNewChatTitle(e.target.value)}
          placeholder="New chat title"
          style={{ width: "100%", marginBottom: 4 }}
        />
        <button onClick={handleCreateChat} style={{ width: "100%" }}>
          + New Chat
        </button>
      </div>

      {/* Main: Conversation */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {selectedChat ? (
            conversation.length > 0 ? (
              conversation.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <div>
                    <b>You:</b> {msg.user_prompt}
                  </div>
                  <div>
                    <b>Bot:</b> {msg.bot_answer}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#888" }}>No conversation yet.</div>
            )
          ) : (
            <div style={{ color: "#888" }}>Select a chat to view conversation.</div>
          )}
        </div>
        {/* Input */}
        <div style={{ padding: 8, borderTop: "1px solid #ccc" }}>
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{ width: "100%", marginBottom: 4 }}
            disabled={!selectedChat}
          />
          <button
            onClick={handleSend}
            disabled={loading || !selectedChat}
            style={{ width: "100%" }}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
      <div style={{ width: "100%", height: 400 }}>
        
      </div>
    </div>
  );
}

export default Chatbot;