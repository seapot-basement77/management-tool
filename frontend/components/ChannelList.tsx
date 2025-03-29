// components/ChannelList.tsx
// ✅ Prismaの型は使わず、自前定義

interface Channel {
  id: string;
  name: string;
}


interface Props {
  channels: Channel[];
  selectedChannel: string;
  setSelectedChannel: (channelName: string) => void;
  onDeleteChannel: (channelId: string) => void;
}

const ChannelList = ({ channels, selectedChannel, setSelectedChannel, onDeleteChannel }: Props) => {
  return (
    <div
      style={{
        width: "240px",
        background: "#1e1f22", // ← 統一ポイント①
        color: "white",
        padding: "1rem", // ← 統一ポイント②
        borderRight: "1px solid #333",
        borderBottom: "1px solid #333", // フォームとの境目調整用（任意）
      }}
    >
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
                onDeleteChannel(channel.id);
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
