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

  const fetchMessages = useCallback(async () => {
    if (!selectedChannel) return;
    try {
      const res = await fetch(`/api/channels/${encodeURIComponent(selectedChannel)}/messages`);
      if (!res.ok) throw new Error(`Failed to fetch messages`);
      const data: Message[] = await res.json();
      setMessagesByChannel((prev) => ({
        ...prev,
        [selectedChannel]: data,
      }));
    } catch (error) {
      console.error("メッセージ取得エラー:", error);
    }
  }, [selectedChannel]);

  // ワークスペース一覧取得
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch('/api/workspace/list');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setWorkspaces(data);
        if (data.length > 0) {
          setCurrentWorkspace(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      }
    };
    fetchWorkspaces();
  }, [setWorkspaces, setCurrentWorkspace]);

  // ワークスペース変更時チャネル一覧取得
  useEffect(() => {
    if (!currentWorkspace) return;
    const fetchChannels = async () => {
      try {
        const res = await fetch(`/api/workspace/${currentWorkspace.id}/channels`);
        if (!res.ok) throw new Error(`Failed to fetch channels`);
        const data = await res.json();
        setChannels(data);
        if (data.length > 0) {
          setSelectedChannel(data[0].name);
        } else {
          setSelectedChannel("");
        }
      } catch (error) {
        console.error("チャネル取得エラー:", error);
      }
    };
    fetchChannels();
  }, [currentWorkspace, setChannels, setSelectedChannel]);

  // チャネル変更時メッセージ一覧取得
  useEffect(() => {
    if (!selectedChannel) return;
    fetchMessages();
  }, [selectedChannel, fetchMessages]);

  // メッセージリアクション
  const handleReactMessage = async (index: number, emoji: string): Promise<"added" | "removed"> => {
    if (!selectedChannel) return "removed"; // ダミー返却

    const targetMessage = messagesByChannel[selectedChannel]?.[index];
    if (!targetMessage) return "removed";

    try {
      const res = await fetch(`/api/channels/${encodeURIComponent(selectedChannel)}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: targetMessage.id, emoji }),
      });

      if (!res.ok) {
        console.error("リアクション送信失敗:", await res.json());
        return "removed";
      }

      let action: "added" | "removed" = "added";

      setMessagesByChannel((prev) => {
        const updated = [...(prev[selectedChannel] || [])];
        const msg = updated[index];

        if (!msg) return prev;

        const alreadyReacted = msg.reactions.find(
          (r) => r.user === currentUser && r.emoji === emoji
        );

        if (alreadyReacted) {
          msg.reactions = msg.reactions.filter(
            (r) => !(r.user === currentUser && r.emoji === emoji)
          );
          action = "removed";
        } else {
          msg.reactions = [...msg.reactions, { user: currentUser, emoji }];
        }

        updated[index] = msg;

        return { ...prev, [selectedChannel]: updated };
      });

      setNotifications((prev) => [
        ...prev,
        {
          type: "reaction",
          sourceUser: currentUser,
          targetChannel: selectedChannel,
          emoji,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      return action;
    } catch (error) {
      console.error("リアクション送信エラー:", error);
      return "removed";
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {currentTab === "Home" && (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ChannelList
              channels={channels}
              setChannels={setChannels}
              selectedChannel={selectedChannel}
              setSelectedChannel={setSelectedChannel}
            />
          </div>

          <ChannelChat
            selectedChannel={selectedChannel}
            messages={messagesByChannel[selectedChannel] || []}
            onReactMessage={handleReactMessage}
            currentUser={currentUser}
            users={users}
            addNotification={(notification) => setNotifications((prev) => [...prev, notification])}
          />
        </>
      )}

      {currentTab === "DM" && (
        <DMArea
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          addUser={(u) => setUsers((prev) => [...prev, u])}
          deleteUser={(u) => setUsers((prev) => prev.filter((user) => user !== u))}
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
                updated[index] = msg;
                return { ...prev, [selectedUser]: updated };
              } else {
                msg.reactions = [...msg.reactions, { user: currentUser, emoji }];
                updated[index] = msg;
                return { ...prev, [selectedUser]: updated };
              }
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
