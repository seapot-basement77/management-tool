// components/ChannelChat.tsx
import { useState, KeyboardEvent, useRef } from "react";
import { Message } from "../types/Message";
import ReactionSelector from "./ReactionSelector";
import { JSX } from "react";

interface Props {
  selectedChannel: string;
  messages?: Message[];
  onSendMessage: (msg: string) => void;
  onReactMessage: (index: number, emoji: string) => void;
  currentUser: string;
  users: string[];
}

const ChannelChat = ({ selectedChannel, messages = [], onSendMessage, onReactMessage, currentUser, users }: Props) => {
  const [input, setInput] = useState("");
  const [selectedReactions, setSelectedReactions] = useState<Record<number, string | null>>({});
  const [mentionCandidates, setMentionCandidates] = useState<string[]>([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
    setMentionCandidates([]);
    setShowMentionList(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionList && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      setMentionIndex((prev) => {
        const max = mentionCandidates.length - 1;
        return e.key === "ArrowUp" ? (prev === 0 ? max : prev - 1) : (prev === max ? 0 : prev + 1);
      });
    } else if (showMentionList && e.key === "Enter") {
      e.preventDefault();
      handleSelectMention(mentionCandidates[mentionIndex]);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Enter" && e.shiftKey) {
      setInput((prev) => prev + "\n");
    }
  };

  const handleChange = (value: string) => {
    setInput(value);
    const match = value.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      const partial = match[1].toLowerCase();
      const filtered = users.filter((u) => u.toLowerCase().includes(partial) && u !== currentUser);
      setMentionCandidates(filtered);
      setMentionIndex(0);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };

  const handleSelectMention = (user: string) => {
    const updated = input.replace(/@([a-zA-Z0-9_]*)$/, `@${user} `);
    setInput(updated);
    setMentionCandidates([]);
    setShowMentionList(false);
    textareaRef.current?.focus();
  };

  const handleSelectReaction = (index: number, emoji: string) => {
    const alreadyReacted = messages[index].reactions.some(
      (r) => r.user === currentUser && r.emoji === emoji
    );
    const newSelected = {
      ...selectedReactions,
      [index]: alreadyReacted ? null : emoji,
    };
    setSelectedReactions(newSelected);
    onReactMessage(index, emoji);
  };

  const highlightMentions = (text: string): (string | JSX.Element)[] => {
    return text.split(/(\s+)/).map((word, i) => {
      if (word.startsWith("@")) {
        return <span key={i} style={{ color: "#87cefa", fontWeight: 500 }}>{word}</span>;
      }
      return word;
    });
  };

  return (
    <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", background: "#36393f", color: "white" }}>
      <h2># {selectedChannel}</h2>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
        {messages.map((msg, idx) => {
          const reactionMap: Record<string, number> = {};
          msg.reactions.forEach((r) => {
            reactionMap[r.emoji] = (reactionMap[r.emoji] || 0) + 1;
          });

          return (
            <div key={idx} style={{ marginBottom: "1rem", background: "#444", padding: "0.5rem", borderRadius: "8px" }}>
              <div><strong>{msg.user}</strong> <small>{msg.timestamp}</small></div>
              <div>{highlightMentions(msg.text)}</div>
              <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {Object.entries(reactionMap).map(([emoji, count]) => (
                  <div
                    key={emoji}
                    style={{
                      background: "#555",
                      borderRadius: "1rem",
                      padding: "0.2rem 0.6rem",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {emoji} <span style={{ fontSize: "0.75rem" }}>{count}</span>
                  </div>
                ))}
                <ReactionSelector
                  selectedEmoji={selectedReactions[idx] || null}
                  onSelect={(emoji) => handleSelectReaction(idx, emoji)}
                  reactionCounts={reactionMap}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "none", resize: "vertical", minHeight: "3rem" }}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Enterで送信 / Shift+Enterで改行)"
        />
        {showMentionList && mentionCandidates.length > 0 && (
          <ul style={{ position: "absolute", bottom: "3.5rem", left: 0, background: "#222", color: "white", listStyle: "none", padding: "0.5rem", borderRadius: "6px", zIndex: 10 }}>
            {mentionCandidates.map((user, i) => (
              <li
                key={user}
                onClick={() => handleSelectMention(user)}
                style={{
                  padding: "0.3rem 0.5rem",
                  cursor: "pointer",
                  background: mentionIndex === i ? "#555" : "transparent",
                }}
              >
                @{user}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChannelChat;
