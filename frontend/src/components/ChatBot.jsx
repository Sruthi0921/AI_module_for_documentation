import { useState } from "react";
import { askChat } from "../services/api";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi 👋 Ask me anything about your documents or general questions."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 

async function send() {
  if (!input.trim()) {
    setMessages(prev => [
      ...prev,
      { role: "bot", text: "❌ Please type a question." }
    ]);
    return;
  }

  const question = input;

  setMessages(prev => [...prev, { role: "user", text: question }]);
  setInput("");
  setLoading(true);

  try {
    const res = await askChat({
      question,
      mode: "USER_GENERAL", // later we switch dynamically
      userId: "guest"
    });

    setMessages(prev => [
      ...prev,
      { role: "bot", text: res.answer }
    ]);
  } catch (err) {
    setMessages(prev => [
      ...prev,
      { role: "bot", text: "❌ " + err.message }
    ]);
  } finally {
    setLoading(false);
  }
}


  return (
    <div style={styles.container}>
      <div style={styles.header}>AI Assistant</div>

      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={m.role === "user" ? styles.userMsg : styles.botMsg}
          >
            {m.text}
          </div>
        ))}

        {loading && <div style={styles.botMsg}>"Analyzing…"
</div>}
      </div>

      {/*ERROR MESSAGE */}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.inputBox}>
        <input
          style={styles.input}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (error) setError("");
          }}
          placeholder="Ask about your document or anything…"
          onKeyDown={e => e.key === "Enter" && send()}
        />

        <button
          style={{
            ...styles.send,
            opacity: !input.trim() ? 0.6 : 1
          }}
          onClick={send}
          disabled={!input.trim() || loading} 
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderLeft: "1px solid #e5e7eb",
    height: "100%",
  },
  header: {
    background: "#1e40af",
    color: "#fff",
    padding: "15px",
    fontWeight: "bold"
  },
  messages: {
    flex: 1,
    padding: "15px",
    background: "#f1f5f9",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  userMsg: {
    alignSelf: "flex-end",
    background: "#2563eb",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    maxWidth: "80%"
  },
  botMsg: {
    alignSelf: "flex-start",
    background: "#fff",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    maxWidth: "80%"
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    padding: "6px 12px"
  },
  inputBox: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #e5e7eb"
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1"
  },
  send: {
    marginLeft: "8px",
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }
};
