import { useState } from "react";
import { useChannelStore } from "../store/ChannelStore";
import { useRouter } from "next/router";

const CreateChannelForm = () => {
  const [channelName, setChannelName] = useState("");
  const setChannels = useChannelStore((state) => state.setChannels);
  const router = useRouter();
  const workspaceId = router.query.id as string; // URLからworkspaceId

  const handleCreate = async () => {
    if (!channelName.trim() || !workspaceId) return;

    // 🔥 ここを修正！
    const res = await fetch(`/api/workspace/${workspaceId}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: channelName }),
    });

    if (res.ok) {
      setChannelName("");

      const updated = await fetch(`/api/workspace/${workspaceId}/channels`);
      if (updated.ok) {
        const data = await updated.json();
        setChannels(data);
      }
    } else {
      alert("作成失敗！");
    }
  };

  return (
    <div style={{
      width: "240px",
      background: "#1e1f22",
      padding: "1rem",
      borderRight: "1px solid #333",
    }}>
      <input
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        placeholder="新しいチャネル名"
        style={{
          padding: "0.5rem",
          marginBottom: "0.5rem",
          width: "100%",
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
