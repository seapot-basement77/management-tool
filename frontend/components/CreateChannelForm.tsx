// components/CreateChannelForm.tsx
import { useState } from "react";
import { useChannelStore } from "../store/ChannelStore";

const CreateChannelForm = () => {
  const [channelName, setChannelName] = useState("");
  const setChannels = useChannelStore((state) => state.setChannels);

  const handleCreate = async () => {
    if (!channelName.trim()) return;

    const res = await fetch("/api/channels/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: channelName }),
    });

    if (res.ok) {
      setChannelName("");

      const updated = await fetch("/api/channels");
      if (updated.ok) {
        const data = await updated.json();
        setChannels(data);
      }
    } else {
      alert("作成失敗！");
    }
  };

  return (
    <div
      style={{
        width: "240px",              // ChannelList と同じ幅
        background: "#1e1f22",       // 背景色も合わせる
        padding: "1rem",             // 内側の余白
        borderRight: "1px solid #333", // 境界線（任意）
      }}
    >
      <input
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        placeholder="新しいチャネル名"
        style={{
          padding: "0.5rem",
          marginBottom: "0.5rem",
          width: "100%",              // 横幅いっぱいに
          borderRadius: "6px",
          border: "none",
        }}
      />
      <button
        onClick={handleCreate}
        style={{
          padding: "0.5rem",
          width: "100%",
          borderRadius: "6px",
          backgroundColor: "#5865f2",
          color: "white",
          border: "none",
        }}
      >
        ＋作成
      </button>
    </div>
  );
};

export default CreateChannelForm;
