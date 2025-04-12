import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { Message } from "../types/Message";
import Image from "next/image";
import ImageModal from "./ImageModal";
import ReactionSelector from "./ReactionSelector";
import { JSX } from "react";

interface Props {
  parentMessage: Message;
  replies: Message[];
  onClose: () => void;
  onSendReply: (text: string, file?: File | null) => Promise<Message | undefined>;
  onReactReply: (replyIndex: number, emoji: string) => Promise<"added" | "removed">;
}

const ThreadArea = ({ parentMessage, replies, onClose, onSendReply, onReactReply }: Props) => {
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localReplies, setLocalReplies] = useState<Message[]>(replies);
  const [localParentMessage, setLocalParentMessage] = useState<Message>(parentMessage);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalReplies(replies);
  }, [replies]);

  useEffect(() => {
    setLocalParentMessage(parentMessage);
  }, [parentMessage]);

  const handleSelectReaction = async (index: number, emoji: string) => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      const action = await onReactReply(index, emoji);

      if (action === "added" || action === "removed") {
        if (index === -1) {
          setLocalParentMessage((prev) => {
            const reactions = [...(prev.reactions || [])];
            const already = reactions.find((r) => r.emoji === emoji);
            if (already && action === "removed") {
              return { ...prev, reactions: reactions.filter((r) => r.emoji !== emoji) };
            } else if (!already && action === "added") {
              return { ...prev, reactions: [...reactions, { user: "you", emoji }] };
            }
            return prev;
          });
        } else {
          setLocalReplies((prev) => {
            const updated = [...prev];
            const target = updated[index];
            if (!target) return prev;
            const reactions = [...(target.reactions || [])];
            const already = reactions.find((r) => r.emoji === emoji);
            if (already && action === "removed") {
              updated[index] = { ...target, reactions: reactions.filter((r) => r.emoji !== emoji) };
            } else if (!already && action === "added") {
              updated[index] = { ...target, reactions: [...reactions, { user: "you", emoji }] };
            }
            return updated;
          });
        }
      }
    } finally {
      setIsReacting(false);
    }
  };

  const highlightMentions = (text: string): (string | JSX.Element)[] =>
    text.split(/(\s+)/).map((word, i) =>
      word.startsWith("@") ? (
        <span key={i} style={{ color: "#87cefa", fontWeight: 500 }}>
          {word}
        </span>
      ) : (
        word
      )
    );

  const reactionMap = (msg: Message): Record<string, number> => {
    const map: Record<string, number> = {};
    msg.reactions.forEach((r) => {
      map[r.emoji] = (map[r.emoji] || 0) + 1;
    });
    return map;
  };

  const handleSendReply = async () => {
    const trimmed = input.trim();
    if (!trimmed && !selectedFile) return;

    const newReply = await onSendReply(trimmed, selectedFile);
    if (newReply) {
      setLocalReplies((prev) => [...prev, newReply]);
      setInput("");
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setInput((prev) => prev + "\n");
    }
  };

  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ width: "400px", background: "#2f3136", color: "white", overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <button onClick={onClose} style={{ margin: "1rem" }}>✖ 戻る</button>

      <div style={{ padding: "1rem", flex: 1 }}>
        <h3>スレッド</h3>

        {/* 親メッセージ */}
        <div style={{ background: "#444", padding: "0.5rem", borderRadius: "8px", marginBottom: "1rem" }}>
          <strong>{localParentMessage.user}</strong> <small>{localParentMessage.timestamp}</small>
          <div>{highlightMentions(localParentMessage.text)}</div>

          {localParentMessage.fileUrl && localParentMessage.fileType?.startsWith("image/") && (
            <div
              style={{ width: "150px", height: "150px", position: "relative", marginTop: "0.5rem", cursor: "pointer" }}
              onClick={() => setModalImageUrl(localParentMessage.fileUrl ?? null)}
            >
              <Image src={localParentMessage.fileUrl} alt="parent img" layout="fill" objectFit="contain" unoptimized />
            </div>
          )}

          {/* 親リアクション */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            {Object.entries(reactionMap(localParentMessage)).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleSelectReaction(-1, emoji)}
                style={{
                  background: "#555",
                  borderRadius: "1rem",
                  padding: "0.2rem 0.6rem",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  cursor: "pointer",
                }}
              >
                {emoji} <span style={{ fontSize: "0.75rem" }}>{count}</span>
              </button>
            ))}
            <ReactionSelector selectedEmoji={null} onSelect={(emoji) => handleSelectReaction(-1, emoji)} reactionCounts={reactionMap(localParentMessage)} />
          </div>
        </div>

        {/* リプライ一覧 */}
        {localReplies.map((reply, idx) => (
          <div key={reply.id} style={{ background: "#555", padding: "0.5rem", borderRadius: "8px", marginBottom: "0.5rem" }}>
            <div><strong>{reply.user}</strong> <small>{reply.timestamp}</small></div>
            <div>{highlightMentions(reply.text)}</div>

            {reply.fileUrl && reply.fileType?.startsWith("image/") && (
              <div
                style={{ width: "150px", height: "150px", position: "relative", marginTop: "0.5rem", cursor: "pointer" }}
                onClick={() => setModalImageUrl(reply.fileUrl ?? null)}
              >
                <Image src={reply.fileUrl} alt="reply img" layout="fill" objectFit="contain" unoptimized />
              </div>
            )}

            {reply.fileUrl && !reply.fileType?.startsWith("image/") && (
              <div style={{ marginTop: "0.5rem" }}>
                <a href={reply.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#87cefa" }}>
                  📎 {reply.fileType ? `[${reply.fileType}]` : "ファイル"}
                </a>
              </div>
            )}

            {/* リプライリアクション */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              {Object.entries(reactionMap(reply)).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleSelectReaction(idx, emoji)}
                  style={{
                    background: "#666",
                    borderRadius: "1rem",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    cursor: "pointer",
                  }}
                >
                  {emoji} <span style={{ fontSize: "0.75rem" }}>{count}</span>
                </button>
              ))}
              <ReactionSelector selectedEmoji={null} onSelect={(emoji) => handleSelectReaction(idx, emoji)} reactionCounts={reactionMap(reply)} />
            </div>
          </div>
        ))}
      </div>

      {/* 返信入力エリア */}
      <div style={{ padding: "1rem", borderTop: "1px solid #555" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="返信を入力...(Enter送信 / Shift+Enter改行)"
          style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "none", resize: "vertical", minHeight: "3rem" }}
        />
        <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={handleFileSelectClick}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.5rem" }}
          >
            📎
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
          {selectedFile && (
            <div style={{ fontSize: "0.9rem", marginLeft: "0.5rem" }}>
              📎 {selectedFile.name}
            </div>
          )}
        </div>
      </div>

      {/* モーダル */}
      {modalImageUrl && (
        <ImageModal imageUrl={modalImageUrl} onClose={() => setModalImageUrl(null)} />
      )}
    </div>
  );
};

export default ThreadArea;
