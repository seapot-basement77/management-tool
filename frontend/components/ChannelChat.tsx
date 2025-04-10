import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Message } from "../types/Message";
import { Notification } from "../types/Notification";
import ReactionSelector from "./ReactionSelector";
import ThreadArea from "./ThreadArea";
import {JSX} from "react";
import Image from "next/image"; // 👈 必須
import ImageModal from "./ImageModal"; // ← 追加

interface Props {
  selectedChannel: string;
  messages?: Message[];
  onReactMessage: (index: number, emoji: string) => Promise<"added" | "removed">;
  currentUser: string;
  users: string[];
  addNotification: (notification: Notification) => void;
}

const ChannelChat = ({
  selectedChannel,
  messages = [],
  onReactMessage,
  currentUser,
  addNotification,
}: Props) => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openThreadMessage, setOpenThreadMessage] = useState<Message | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // 普通メッセージ送信
  const handleSendChannelMessage = async (text: string, file?: File | null): Promise<Message | undefined> => {
    if (!selectedChannel) return;
    const formData = new FormData();
    formData.append("text", text);
    if (file) formData.append("file", file);

    const res = await fetch(`/api/channels/${selectedChannel}/messages`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const newMessage: Message = await res.json();
      setLocalMessages((prev) => [...prev, newMessage]);
      return newMessage;
    } else {
      console.error("メッセージ送信エラー:", await res.json());
    }
  };

  // スレッド返信送信
  const handleSendThreadReply = async (text: string, parentMessage: Message, file?: File | null): Promise<Message | undefined> => {
    if (!selectedChannel) return;
    const formData = new FormData();
    formData.append("text", text);
    formData.append("replyToMessageId", parentMessage.id);
    if (file) formData.append("file", file);

    const res = await fetch(`/api/channels/${selectedChannel}/messages`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const newReply: Message = await res.json();
      return newReply;
    } else {
      console.error("スレッド返信送信エラー:", await res.json());
    }
  };

  // メッセージ送信ボタン押下
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed && !selectedFile) return;

    if (openThreadMessage) {
      const newReply = await handleSendThreadReply(trimmed, openThreadMessage, selectedFile);
      if (newReply) {
        setOpenThreadMessage((prev) => {
          if (!prev) return null;
          return { ...prev, replies: [...(prev.replies || []), newReply] };
        });
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === openThreadMessage.id
              ? { ...msg, replies: [...(msg.replies || []), newReply] }
              : msg
          )
        );
      }
    } else {
      await handleSendChannelMessage(trimmed, selectedFile);
    }

    setInput("");
    setSelectedFile(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setInput((prev) => prev + "\n");
    }
  };

  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  const reactionMap = (msg: Message): Record<string, number> => {
    const map: Record<string, number> = {};
    msg.reactions.forEach((r) => {
      map[r.emoji] = (map[r.emoji] || 0) + 1;
    });
    return map;
  };

  const handleSelectReaction = async (index: number, emoji: string) => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      const action = await onReactMessage(index, emoji);
      if (action === "added") {
        addNotification({
          type: "reaction",
          sourceUser: currentUser,
          targetChannel: selectedChannel,
          emoji,
          timestamp: new Date().toLocaleTimeString(),
        });
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

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "row", background: "#36393f", color: "white" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <h2 style={{ padding: "1rem" }}># {selectedChannel}</h2>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 1rem" }}>
          {localMessages.map((msg, idx) => (
            <div key={idx} style={{ background: "#444", marginBottom: "1rem", padding: "0.5rem", borderRadius: "8px" }}>
              <div><strong>{msg.user}</strong> <small>{msg.timestamp}</small></div>
              <div>{highlightMentions(msg.text)}</div>

              {msg.fileUrl && (
  <div style={{ marginTop: "0.5rem" }}>
    {msg.fileType?.startsWith("image/") ? (
      <div
        style={{
          position: "relative",
          width: "200px",
          height: "200px",
          cursor: "pointer",
          borderRadius: "8px",
          overflow: "hidden",
        }}
        onClick={() => setModalImageUrl(msg.fileUrl ?? null)}
      >
        <Image
          src={msg.fileUrl}
          alt="uploaded image"
          layout="fill"
          objectFit="contain"
          unoptimized
        />
      </div>
    ) : (
      <a
        href={msg.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#87cefa", textDecoration: "underline" }}
      >
        📎 {msg.fileType ? `[${msg.fileType}]` : "ファイル"}
      </a>
    )}
  </div>
)}


              {/* リアクション */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                {Object.entries(reactionMap(msg)).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => handleSelectReaction(idx, emoji)}
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
                <ReactionSelector
                  selectedEmoji={null}
                  onSelect={(emoji) => handleSelectReaction(idx, emoji)}
                  reactionCounts={reactionMap(msg)}
                />
              </div>

              {/* スレッドボタン */}
              {(msg.replies && msg.replies.length > 0) ? (
  <button
    onClick={() => setOpenThreadMessage(msg)}
    style={{
      background: "transparent",
      border: "none",
      color: "#bbb",
      cursor: "pointer",
      marginTop: "0.5rem",
    }}
  >
    💬 {msg.replies.length}件の返信を見る
  </button>
) : (
  <button
    onClick={() => setOpenThreadMessage(msg)}
    style={{
      background: "transparent",
      border: "none",
      color: "#bbb",
      cursor: "pointer",
      marginTop: "0.5rem",
    }}
  >
    💬 スレッドで返信
  </button>
)}

{/* 👇 モーダル表示は mapの外に！ */}
{modalImageUrl && (
  <ImageModal imageUrl={modalImageUrl} onClose={() => setModalImageUrl(null)} />
)}

            </div>
          ))}
        </div>

        {/* メッセージ入力 */}
        <div style={{ position: "relative", padding: "1rem" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力...(Enter送信 / Shift+Enter改行)"
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
      </div>

      {/* スレッドエリア */}
      {openThreadMessage && (
        <ThreadArea
          parentMessage={openThreadMessage}
          replies={openThreadMessage.replies || []}
          onClose={() => setOpenThreadMessage(null)}
          onSendReply={async (text, file) => {
            const newReply = await handleSendThreadReply(text, openThreadMessage, file);
            if (!newReply) return newReply;
            setOpenThreadMessage((prev) => {
              if (!prev) return null;
              return { ...prev, replies: [...(prev.replies || []), newReply] };
            });
            setLocalMessages((prev) =>
              prev.map((msg) =>
                msg.id === openThreadMessage.id
                  ? { ...msg, replies: [...(msg.replies || []), newReply] }
                  : msg
              )
            );
            return newReply;
          }}
          onReactReply={async () => "added"}
        />
      )}
    </div>
  );
};

export default ChannelChat;
