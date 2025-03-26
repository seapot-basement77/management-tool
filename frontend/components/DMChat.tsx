import { useState } from "react";

type Props = {
  user: string;
  messages: string[];
  onSendMessage: (msg: string) => void;
};

const DMChat = ({ user, messages, onSendMessage }: Props) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <div style={{ flex: 1, padding: "1rem", backgroundColor: "#36393f", color: "white", display: "flex", flexDirection: "column" }}>
      <h2>💬 {user} さんとのDM</h2>
      <div style={{ flex: 1, overflowY: "auto", margin: "1rem 0" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "0.5rem", background: "#444", padding: "0.5rem", borderRadius: "8px" }}>
            {msg}
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "none" }}
        />
        <button
          onClick={handleSend}
          style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem", borderRadius: "6px", background: "#7289da", color: "#fff", border: "none" }}
        >
          送信
        </button>
      </div>
    </div>
  );
};

export default DMChat;
