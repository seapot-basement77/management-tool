// components/ReactionSelector.tsx
import { useState } from "react";

const availableReactions = ["👍", "❤️", "😂", "🎉", "😮", "😢"];

interface Props {
  onSelect: (emoji: string) => void;
  selectedEmoji: string | null;
  reactionCounts: Record<string, number>;
}

const ReactionSelector = ({ onSelect, selectedEmoji, reactionCounts }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={toggleOpen}
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        😊
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "2rem",
            left: 0,
            background: "#2a2c30",
            padding: "0.5rem",
            borderRadius: "8px",
            display: "flex",
            gap: "0.5rem",
            zIndex: 10,
          }}
        >
          {availableReactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                setIsOpen(false);
              }}
              style={{
                fontSize: "1.2rem",
                background: selectedEmoji === emoji ? "#7289da" : "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {emoji}
              {reactionCounts[emoji] > 1 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    fontSize: "0.7rem",
                    width: "1.2rem",
                    height: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {reactionCounts[emoji]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionSelector;
