// ChannelChat.tsx - 型を外部の Message に切り出して整理
import { useState } from "react";
import { Message } from "../types/Message";

type Props = {
  selectedChannel: string;
  messages: Message[];
  onSendMessage: (msg: string) => void;
  onReactMessage: (index: number, emoji: string) => void;
};

const ChannelChat = ({ selectedChannel, messages, onSendMessage, onReactMessage }: Props) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", background: "#36393f", color: "white" }}>
      <h2># {selectedChannel}</h2>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "1rem", background: "#444", padding: "0.5rem", borderRadius: "8px" }}>
            <div><strong>{msg.user}</strong> <small>{msg.timestamp}</small></div>
            <div>{msg.text}</div>
            <div style={{ marginTop: "0.5rem" }}>
              {msg.reactions.map((r, rIdx) => (
                <span key={rIdx} style={{ marginRight: "0.5rem" }}>{r}</span>
              ))}
              <button onClick={() => onReactMessage(idx, "👍")} style={{ marginLeft: "0.5rem" }}>👍</button>
              <button onClick={() => onReactMessage(idx, "🔥")} style={{ marginLeft: "0.5rem" }}>🔥</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex" }}>
        <input
          style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "none" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
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

export default ChannelChat;
