// pages/workspace/index.tsx
import Sidebar from "../../components/Sidebar";
import ChannelList from "../../components/ChannelList";
import ChannelChat from "../../components/ChannelChat";
import ChannelForm from "../../components/CreateChannelForm";
import TaskChannelList from "../../components/TaskChannelList";
import DMArea from "../../components/DMArea";
import Activity from "../../components/Activity";
import TaskArea from "../../components/TaskArea";
import { Message } from "../../types/Message";
import { Notification } from "../../types/Notification";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useChannelStore } from "../../store/ChannelStore";
import { useWorkspaceStore } from "../../store/workspaceStore";


export default function WorkspaceHome() {
  const [currentTab, setCurrentTab] = useState("Home");
  const channels = useChannelStore((state) => state.channels);
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>({});
  const [users, setUsers] = useState<string[]>(["Alice", "Bob"]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<Record<string, Message[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session, status } = useSession();
  const setChannels = useChannelStore((state) => state.setChannels);
  const selectedChannel = useChannelStore((state) => state.selectedChannel);
  const setSelectedChannel = useChannelStore((state) => state.setSelectedChannel);
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch("/api/channels");
        if (!res.ok) {
          throw new Error("API fetch failed with status " + res.status);
        }
        const data = await res.json();
        setChannels(data);
        if (data.length > 0) {
          setSelectedChannel(data[0].name); // 初期選択
        }
      } catch (err) {
        console.error("チャネル取得エラー:", err);
      }
    };
    fetchChannels();
  }, [setChannels, setSelectedChannel]);

  const { setWorkspaces, setCurrentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch('/api/workspace/list');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setWorkspaces(data);
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      }
    };

    fetchWorkspaces();
  }, [setWorkspaces, setCurrentWorkspace]); 
  const { currentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (!currentWorkspace) return;

  // ワークスペースごとのチャネル取得など
    fetch(`/api/workspace/${currentWorkspace.id}/channels`);
  }, [currentWorkspace]);


  if (status === "loading") {
    return <div style={{ color: "#fff", padding: "2rem" }}>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div style={{ color: "#fff", padding: "2rem" }}>ログインが必要です</div>;
  }

  const currentUser = session?.user?.name || "ゲスト";
  const mockUsers = ["Alice", "Bob", "Charlie"];


  const handleSendMessage = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();

    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentionMatches = [...text.matchAll(mentionRegex)];
    const mentionedUsers = mentionMatches.map((match) => match[1]);

    const newMessage: Message = {
      text,
      user: currentUser,
      timestamp,
      reactions: [],
      mentions: mentionedUsers,
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [selectedChannel]: [...(prev[selectedChannel] || []), newMessage],
    }));

    const mentionNotifications: Notification[] = mentionedUsers.map((targetUser) => ({
      type: "mention",
      sourceUser: currentUser,
      targetUser,
      message: text,
      timestamp,
    }));

    setNotifications((prev) => [...prev, ...mentionNotifications]);
  };
  
  const handleReactMessage = (index: number, emoji: string) => {
    setMessagesByChannel((prev) => {
      const updated = [...(prev[selectedChannel] || [])];
      const msg = updated[index];
      const already = msg.reactions.find((r) => r.user === currentUser && r.emoji === emoji);
      msg.reactions = already
        ? msg.reactions.filter((r) => !(r.user === currentUser && r.emoji === emoji))
        : [...msg.reactions, { user: currentUser, emoji }];
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
  };

  const handleReactDM = (index: number, emoji: string) => {
    if (!selectedUser) return;
    setMessagesByUser((prev) => {
      const updated = [...(prev[selectedUser] || [])];
      const msg = updated[index];
      const already = msg.reactions.find((r) => r.user === currentUser && r.emoji === emoji);
      msg.reactions = already
        ? msg.reactions.filter((r) => !(r.user === currentUser && r.emoji === emoji))
        : [...msg.reactions, { user: currentUser, emoji }];
      updated[index] = msg;
      return { ...prev, [selectedUser]: updated };
    });
  };

  const handleDeleteChannel = async (channelId: string) => {
    const res = await fetch(`/api/channels/delete?id=${channelId}`, {
      method: "DELETE",
    });
  
    if (res.ok) {
      const updated = await fetch("/api/channels");
      if (updated.ok) {
        const data = await updated.json();
        setChannels(data);
        if (selectedChannel === data.name) {
          setSelectedChannel(data[0]?.name || "");
        }
      }
    } else {
      alert("削除失敗！");
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
              selectedChannel={selectedChannel}
              setSelectedChannel={setSelectedChannel} 
              onDeleteChannel={handleDeleteChannel} />

            <ChannelForm/>
          </div>

          <ChannelChat
            selectedChannel={selectedChannel}
            messages={messagesByChannel[selectedChannel] || []}
            onSendMessage={handleSendMessage}
            onReactMessage={handleReactMessage}
            currentUser={currentUser}
            users={users}
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
              text: msg,
              user: currentUser,
              timestamp: new Date().toLocaleTimeString(),
              reactions: [],
            };
            setMessagesByUser((prev) => ({
              ...prev,
              [selectedUser]: [...(prev[selectedUser] || []), newMsg],
            }));
          }}
          onReactMessage={handleReactDM}
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
          <TaskArea selectedChannel={selectedChannel} users={mockUsers} />
          </>
      )}

      {currentTab === "Calendar" && (
        <div style={{ flex: 1, padding: "2rem", backgroundColor: "#2a2c30", color: "#fff" }}>
          📅 カレンダータブ：予定表
        </div>
      )}

      {currentTab === "Meeting" && (
        <div style={{ flex: 1, padding: "2rem", backgroundColor: "#2a2c30", color: "#fff" }}>
          🎦 ミーティング：会議情報
        </div>
      )}

      {currentTab === "Activity" && (
        <Activity notifications={notifications} />
      )}
    </div>
  );
}
