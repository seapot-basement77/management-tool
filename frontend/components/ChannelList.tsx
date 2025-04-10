import { useWorkspaceStore } from "../store/workspaceStore";
import { useState, useEffect, useRef } from "react";

interface Channel {
  id: string;
  name: string;
}

interface Props {
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  selectedChannel: string;
  setSelectedChannel: (channelName: string) => void;
}

const ChannelList = ({ channels, setChannels, selectedChannel, setSelectedChannel }: Props) => {
  const { currentWorkspace } = useWorkspaceStore();
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isInviteDropdownOpen, setIsInviteDropdownOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const createDropdownRef = useRef<HTMLDivElement>(null);
  const inviteDropdownRef = useRef<HTMLDivElement>(null);

  // 📦 共通：チャネルリストをリフレッシュ
  const refreshChannels = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`/api/workspace/${currentWorkspace.id}/channels`, { cache: "no-store" });
      if (!res.ok) throw new Error("チャネル一覧取得失敗");
      const data = await res.json();
      setChannels(data);
    } catch (err) {
      console.error("🔥 チャネルリスト取得エラー:", err);
      alert("チャネルリストの更新に失敗しました");
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!currentWorkspace?.id) return;

    try {
      const res = await fetch(`/api/channels/delete?id=${channelId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("チャネル削除失敗");

      await refreshChannels();
    } catch (err) {
      console.error("🔥 チャネル削除エラー:", err);
      alert("チャネル削除に失敗しました");
    }
  };

  const handleCreateChannel = async () => {
    if (!channelName.trim() || !currentWorkspace?.id) return;

    try {
      const res = await fetch(`/api/channels/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: channelName, workspaceId: currentWorkspace.id }),
      });

      if (!res.ok) throw new Error("チャンネル作成失敗");

      setChannelName("");
      setIsCreateDropdownOpen(false);

      await refreshChannels();
    } catch (err) {
      console.error("🔥 チャンネル作成エラー:", err);
      alert("チャンネル作成に失敗しました");
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !currentWorkspace?.id) return;

    try {
      const res = await fetch(`/api/workspace/${currentWorkspace.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!res.ok) throw new Error("メンバー招待失敗");

      setInviteEmail("");
      setIsInviteDropdownOpen(false);
      alert("メンバーを招待しました！");
    } catch (err) {
      console.error("🔥 メンバー招待エラー:", err);
      alert("メンバー招待に失敗しました");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        createDropdownRef.current && !createDropdownRef.current.contains(event.target as Node) &&
        inviteDropdownRef.current && !inviteDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCreateDropdownOpen(false);
        setIsInviteDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ width: "320px", background: "#1e1a2d", color: "white", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", height: "100vh", borderRight: "1px solid #333", position: "relative" }}>
      <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff", fontWeight: "bold" }}>
        {currentWorkspace?.name || "Workspace"}
        <button style={{ background: "transparent", border: "none", color: "#bbb", cursor: "pointer" }}>
          ⚙️
        </button>
      </h2>

      <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem", color: "#aaa", fontWeight: "bold" }}>
        ▾ チャンネル
      </h3>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {channels.map((channel) => (
          <li
            key={channel.id}
            onClick={() => setSelectedChannel(channel.name)}
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "5px",
              backgroundColor: selectedChannel === channel.name ? "#4b4277" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: "1rem",
              fontWeight: "bold",
              color: "#eee",
              transition: "background-color 0.2s ease",
            }}
          >
            <span style={{ flexGrow: 1, textAlign: "left" }}>#{channel.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChannel(channel.id);
              }}
              style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", marginLeft: "0.3rem" }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      {/* チャンネル追加ボタン */}
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => {
            setIsCreateDropdownOpen((prev) => !prev);
            setIsInviteDropdownOpen(false);
          }}
          style={{ background: "transparent", color: "#bbb", fontSize: "1rem", cursor: "pointer", border: "none", padding: "0.6rem 0", width: "100%", textAlign: "left", borderRadius: "6px", fontWeight: "bold" }}
        >
          + チャンネルを追加する
        </button>

        {isCreateDropdownOpen && (
          <div ref={createDropdownRef} style={{ backgroundColor: "#2b2447", padding: "1.2rem", marginTop: "0.7rem", borderRadius: "10px" }}>
            <input
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="新しいチャンネル名"
              style={{ width: "100%", padding: "0.6rem", marginBottom: "0.8rem", borderRadius: "6px", border: "none", backgroundColor: "#2A1E3B", color: "#fff" }}
            />
            <button
              onClick={handleCreateChannel}
              style={{ width: "100%", padding: "0.8rem", backgroundColor: "#5865f2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              ＋ 作成
            </button>
          </div>
        )}

        {/* メンバー招待ボタン */}
        <button
          onClick={() => {
            setIsInviteDropdownOpen((prev) => !prev);
            setIsCreateDropdownOpen(false);
          }}
          style={{ background: "transparent", color: "#bbb", fontSize: "1rem", cursor: "pointer", border: "none", padding: "0.6rem 0", width: "100%", textAlign: "left", borderRadius: "6px", fontWeight: "bold", marginTop: "0.7rem" }}
        >
          + メンバーを招待
        </button>

        {isInviteDropdownOpen && (
          <div ref={inviteDropdownRef} style={{ backgroundColor: "#2b2447", padding: "1.2rem", marginTop: "0.7rem", borderRadius: "10px" }}>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              style={{ width: "100%", padding: "0.6rem", marginBottom: "0.8rem", borderRadius: "6px", border: "none", backgroundColor: "#2A1E3B", color: "#fff" }}
            />
            <button
              onClick={handleInviteMember}
              style={{ width: "100%", padding: "0.8rem", backgroundColor: "#43b581", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              📩 招待
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelList;
