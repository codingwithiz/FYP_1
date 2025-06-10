import { useState } from "react";
import axios from "axios";

function Chatbot({ onExtracted }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3001/api/chatbot", {
        message: input,
      });

      const result = res.data;
      if (onExtracted && result.location && result.category) {
        onExtracted(result);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <h3 style={{ marginTop: 0 }}>Business Location Chatbot</h3>
      <textarea
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your business idea (e.g., I want to open a cafe near Bangsar)..."
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <button onClick={handleSend} disabled={loading} style={{ width: "100%" }}>
        {loading ? "Thinking..." : "Send"}
      </button>
    </div>
  );
}

export default Chatbot;
