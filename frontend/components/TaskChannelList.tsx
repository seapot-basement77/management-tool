// components/TaskChannelList.tsx

// ✅ Prismaの型は使わず、自前で定義
interface Channel {
  id: string;
  name: string;
}

interface Props {
  channels: Channel[];
  selectedChannel: string;
  setSelectedChannel: (channelName: string) => void;
}

const TaskChannelList = ({ channels, selectedChannel, setSelectedChannel }: Props) => {
  return (
    <div
      style={{
        width: "200px",
        background: "#1e1f22",
        color: "white",
        padding: "1rem",
        boxSizing: "border-box",
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
            }}
          >
            #{channel.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskChannelList;
