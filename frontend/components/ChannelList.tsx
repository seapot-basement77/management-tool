type Props = {
    channels: string[];
    setChannels: (channels: string[]) => void;
    selectedChannel: string;
    setSelectedChannel: (channel: string) => void;
  };
  import { useState } from "react";

  const ChannelList = ({
    channels,
    setChannels,
    selectedChannel,
    setSelectedChannel,
  }: Props) => {
    const [newChannel, setNewChannel] = useState("");
  
    const handleAddChannel = () => {
      const trimmed = newChannel.trim();
      if (!trimmed || channels.includes(trimmed)) return;
      setChannels([...channels, trimmed]);
      setNewChannel("");
    };
  
    const handleDeleteChannel = (channelToDelete: string) => {
      if (channelToDelete === "general") {
        alert("general は削除できません！");
        return;
      }
      const updated = channels.filter((ch) => ch !== channelToDelete);
      setChannels(updated);
  
      // 削除したのが選択中のチャネルだったら fallback
      if (selectedChannel === channelToDelete) {
        setSelectedChannel(updated[0] || "general");
      }
    };
  
    return (
      <div
        style={{
          width: "240px",
          backgroundColor: "#2f3136",
          color: "white",
          padding: "1rem",
          boxSizing: "border-box",
          borderRight: "1px solid #444",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h3 style={{ fontSize: "1.1rem" }}>📚 チャネル</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {channels.map((channel) => (
            <li
              key={channel}
              style={{
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: selectedChannel === channel ? "#3a3d40" : "transparent",
                borderRadius: "4px",
                padding: "0.3rem 0.5rem",
                cursor: "pointer",
              }}
            >
              <span onClick={() => setSelectedChannel(channel)}># {channel}</span>
              {channel !== "general" && (
                <button
                  onClick={() => handleDeleteChannel(channel)}
                  style={{
                    marginLeft: "0.5rem",
                    background: "none",
                    border: "none",
                    color: "#ccc",
                    cursor: "pointer",
                  }}
                >
                  🗑️
                </button>
              )}
            </li>
          ))}
        </ul>
  
        <div style={{ marginTop: "auto" }}>
          <input
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            placeholder="＋ チャネル追加"
            style={{
              width: "100%",
              padding: "0.4rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#40444b",
              color: "white",
            }}
          />
          <button
            onClick={handleAddChannel}
            style={{
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.4rem",
              borderRadius: "4px",
              backgroundColor: "#7289da",
              border: "none",
              color: "white",
            }}
          >
            追加
          </button>
        </div>
      </div>
    );
  };
  
  export default ChannelList;
  