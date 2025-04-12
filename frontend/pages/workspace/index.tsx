import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../../components/Sidebar";
import ChannelList from "../../components/ChannelList";
import ChannelChat from "../../components/ChannelChat";
import DMArea from "../../components/DMArea";
import TaskChannelList from "../../components/TaskChannelList";
import TaskArea from "../../components/TaskArea";
import Activity from "../../components/Activity";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useChannelStore } from "../../store/ChannelStore";
import { Message } from "../../types/Message";
import { Notification } from "../../types/Notification";

export default function WorkspaceHome() {
  const [currentTab, setCurrentTab] = useState("Home");
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>({});
  const [messagesByUser, setMessagesByUser] = useState<Record<string, Message[]>>({});
  const [users, setUsers] = useState<string[]>(["Alice", "Bob"]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: session } = useSession();
  const { setWorkspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const { channels, setChannels, selectedChannel, setSelectedChannel } = useChannelStore();

  const currentUser = session?.user?.name || "ゲスト";

  // --- fetch messages
  const fetchMessages = useCallback(async (channelName?: string) => {
    const target = channelName || selectedChannel;
    if (!target) return;
    try {
      const res = await fetch(`/api/channels/${encodeURIComponent(target)}/messages`);
      if (!res.ok) throw new Error("メッセージ取得失敗");
      const data: Message[] = await res.json();
      setMessagesByChannel((prev) => ({
        ...prev,
        [target]: data,
      }));
    } catch (err) {
      console.error("🔥 メッセージ取得エラー:", err);
    }
  }, [selectedChannel]);

  // --- fetch channels
  const fetchChannels = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`/api/workspace/${currentWorkspace.id}/channels`);
      if (!res.ok) throw new Error("チャネル取得失敗");
      const data = await res.json();
      setChannels(data);
      if (data.length > 0) {
        setSelectedChannel(data[0].name);
      } else {
        setSelectedChannel("");
      }
    } catch (err) {
      console.error("🔥 チャネル取得エラー:", err);
    }
  }, [currentWorkspace, setChannels, setSelectedChannel]);

  // --- fetch workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch("/api/workspace/list");
        if (!res.ok) throw new Error("ワークスペース取得失敗");
        const data = await res.json();
        setWorkspaces(data);
        if (data.length > 0) {
          setCurrentWorkspace(data[0]);
        }
      } catch (err) {
        console.error("🔥 ワークスペース取得エラー:", err);
      }
    };
    fetchWorkspaces();
  }, [setWorkspaces, setCurrentWorkspace]);

  // --- チャネル取得（ワークスペース変更時）
  useEffect(() => {
    if (currentWorkspace) {
      fetchChannels();
    }
  }, [currentWorkspace, fetchChannels]);

  // --- メッセージ取得（チャネル変更時 or タブ変更時）
  useEffect(() => {
    if (currentTab === "Home" && selectedChannel) {
      fetchMessages(selectedChannel);
    }
  }, [currentTab, selectedChannel, fetchMessages]);

  // --- リアクション処理
  const handleReactMessage = async (index: number, emoji: string): Promise<"added" | "removed"> => {
    if (!selectedChannel) return "removed";
    const target = messagesByChannel[selectedChannel]?.[index];
    if (!target) return "removed";
  
    try {
      const res = await fetch(`/api/channels/${encodeURIComponent(selectedChannel)}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: target.id, emoji }),
      });
  
      if (!res.ok) {
        console.error("リアクション送信失敗:", await res.json());
        return "removed";
      }
  
      let action: "added" | "removed" = "added";
  
      setMessagesByChannel((prev) => {
        const updatedMessages = [...(prev[selectedChannel] || [])];
        const targetMessage = updatedMessages[index];
        if (!targetMessage) return prev;
  
        const already = targetMessage.reactions.find(r => r.user === currentUser && r.emoji === emoji);
        if (already) {
          targetMessage.reactions = targetMessage.reactions.filter(r => !(r.user === currentUser && r.emoji === emoji));
          action = "removed";
        } else {
          targetMessage.reactions = [...targetMessage.reactions, { user: currentUser, emoji }];
        }
  
        updatedMessages[index] = targetMessage;
  
        return {
          ...prev,
          [selectedChannel]: updatedMessages,
        };
      });
  
      return action;
    } catch (err) {
      console.error("🔥 リアクション送信エラー:", err);
      return "removed";
    }
  };
  
  

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {currentTab === "Home" && (
        <>
          <ChannelList
            channels={channels}
            setChannels={setChannels}
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
            fetchMessages={fetchMessages}
          />
          <ChannelChat
            selectedChannel={selectedChannel}
            messages={messagesByChannel[selectedChannel] || []}
            onReactMessage={handleReactMessage}
            currentUser={currentUser}
            users={users}
            addNotification={(notification) => setNotifications((prev) => [...prev, notification])}
            fetchMessages={fetchMessages}
            setMessagesByChannel={setMessagesByChannel}
          />
        </>
      )}

      {currentTab === "DM" && (
        <DMArea
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          addUser={(u) => setUsers((prev) => [...prev, u])}
          deleteUser={(u) => setUsers((prev) => prev.filter(user => user !== u))}
          messages={selectedUser ? messagesByUser[selectedUser] || [] : []}
          onSendMessage={(msg) => {
            if (!selectedUser) return;
            const newMsg: Message = {
              id: crypto.randomUUID(),
              text: msg,
              user: currentUser,
              mentions: [],
              timestamp: new Date().toLocaleTimeString(),
              reactions: [],
            };
            setMessagesByUser((prev) => ({
              ...prev,
              [selectedUser]: [...(prev[selectedUser] || []), newMsg],
            }));
          }}
          onReactMessage={(index, emoji) => {
            if (!selectedUser) return Promise.resolve("removed");
            setMessagesByUser((prev) => {
              const updated = [...(prev[selectedUser] || [])];
              const msg = updated[index];
              if (!msg) return prev;

              const already = msg.reactions.find((r) => r.user === currentUser && r.emoji === emoji);
              if (already) {
                msg.reactions = msg.reactions.filter((r) => !(r.user === currentUser && r.emoji === emoji));
              } else {
                msg.reactions = [...msg.reactions, { user: currentUser, emoji }];
              }
              updated[index] = msg;
              return { ...prev, [selectedUser]: updated };
            });
            return Promise.resolve("added");
          }}
          currentUser={currentUser}
        />
      )}

      {currentTab === "Task" && (
        <>
          <TaskChannelList
            channels={channels}
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
          />
          <TaskArea selectedChannel={selectedChannel} users={users} />
        </>
      )}

      {currentTab === "Calendar" && (
        <div style={{ flex: 1, padding: "2rem", backgroundColor: "#2a2c30", color: "#fff" }}>
          📅 カレンダー
        </div>
      )}

      {currentTab === "Meeting" && (
        <div style={{ flex: 1, padding: "2rem", backgroundColor: "#2a2c30", color: "#fff" }}>
          🎦 ミーティング
        </div>
      )}

      {currentTab === "Activity" && (
        <Activity notifications={notifications} />
      )}
    </div>
  );
}
