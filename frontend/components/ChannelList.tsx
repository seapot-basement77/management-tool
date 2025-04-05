// components/ChannelList.tsx
import { useWorkspaceStore } from "../store/workspaceStore";
import { useChannelStore } from "../store/ChannelStore";
import { useRouter } from "next/router";

interface Channel {
  id: string;
  name: string;
}

interface Props {
  channels: Channel[];
  selectedChannel: string;
  setSelectedChannel: (channelName: string) => void;
}

const ChannelList = ({ channels, selectedChannel, setSelectedChannel }: Props) => {
  const { currentWorkspace } = useWorkspaceStore();
  const setChannels = useChannelStore((state) => state.setChannels);
  const router = useRouter();
  const workspaceId = router.query.id as string;

  const handleDeleteChannel = async (channelId: string) => {
    if (!workspaceId) return;

    const res = await fetch(`/api/channels/delete?id=${channelId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      // 削除後にチャンネル一覧をリロード
      const updated = await fetch(`/api/workspace/${workspaceId}/channels`);
      if (updated.ok) {
        const data = await updated.json();
        setChannels(data);
      }
    } else {
      alert("チャネル削除に失敗しました");
    }
  };

  return (
    <div
      style={{
        width: "240px",
        background: "#1e1f22",
        color: "white",
        padding: "1rem",
        borderRight: "1px solid #333",
        borderBottom: "1px solid #333",
      }}
    >
      <h2
        style={{
          fontSize: "1.2rem",
          marginBottom: "1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {currentWorkspace?.name || "Workspace"}
        <button
          style={{
            background: "transparent",
            border: "none",
            color: "#ccc",
            cursor: "pointer",
          }}
          onClick={() => alert("将来的に：メンバー招待 or 設定を開く")}
        >
          ⚙️
        </button>
      </h2>

      <h3 style={{ marginBottom: "1rem" }}>📂 チャネル</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {channels.map((channel) => (
          <li
            key={channel.id}
            onClick={() => setSelectedChannel(channel.name)}
            style={{
              padding: "0.5rem 0.8rem",
              marginBottom: "0.5rem",
              borderRadius: "6px",
              backgroundColor: selectedChannel === channel.name ? "#7289da" : "transparent",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>#{channel.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChannel(channel.id); // ✅ ここを自前のhandleDeleteに
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#aaa",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChannelList;
