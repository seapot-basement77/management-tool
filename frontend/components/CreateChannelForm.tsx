import { useState } from "react";
import { useChannelStore } from "../store/ChannelStore";
import { useRouter } from "next/router";

const CreateChannelForm = () => {
  const [channelName, setChannelName] = useState("");
  const setChannels = useChannelStore((state) => state.setChannels);
  const router = useRouter();
  const workspaceId = router.query.id as string;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); // submit時のリロード防止

    if (!channelName.trim() || !workspaceId) return;

    console.log("✅ Createボタン押された", channelName, workspaceId); // デバッグログ

    const res = await fetch(`/api/channels/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: channelName, workspaceId }),
    });

    if (res.ok) {
      setChannelName("");
      // チャネル一覧を更新
      const updated = await fetch(`/api/workspace/${workspaceId}/channels`);
      if (updated.ok) {
        const data = await updated.json();
        setChannels(data);
      }
    } else {
      const errorData = await res.json();
      alert(`作成失敗: ${errorData.error}`);
    }
  };

  return (
    <form onSubmit={handleCreate} style={{ padding: "1rem", backgroundColor: "#3F2A4D", borderRadius: "8px", color: "#fff" }}>
      <input
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        placeholder="新しいチャネル名"
        style={{
          padding: "0.6rem",
          width: "100%",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#2A1E3B",
          color: "#fff",
          marginBottom: "1rem",
        }}
      />
      <button
        type="submit" // ← ここ！submitにする！
        style={{
          width: "100%",
          padding: "0.8rem",
          backgroundColor: "#5865f2",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ＋ 作成
      </button>
    </form>
  );
};

export default CreateChannelForm;
