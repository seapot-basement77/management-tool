// pages/workspace/index.tsx（簡略化されたバージョン）
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import ChannelArea from "../../components/ChannelArea";
import DMArea from "../../components/DMArea";
import Activity from "../../components/Activity";
import { Message } from "../../types/Message";
import { Notification } from "../../types/Notification";

export default function WorkspaceHome() {
  const [currentTab, setCurrentTab] = useState("Home");
  const [channels, setChannels] = useState(["general", "random"]);
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>({
    general: [],
    random: [],
  });

  const [users, setUsers] = useState(["Alice", "Bob"]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messagesByUser, setMessagesByUser] = useState<Record<string, Message[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const extractMentions = (text: string) => {
    return users.filter((u) => text.includes(`@${u}`));
  };

  const updateMessages = (channel: string, newMessage: string) => {
    const mentions = extractMentions(newMessage);
    const messageObj: Message = {
      text: newMessage,
      user: "You",
      timestamp: new Date().toLocaleString(),
      reactions: [],
      mentions,
    };
    setMessagesByChannel((prev) => ({
      ...prev,
      [channel]: [...(prev[channel] || []), messageObj],
    }));
    mentions.forEach((targetUser) => {
      setNotifications((prev) => [
        ...prev,
        {
          type: "mention",
          sourceUser: "You",
          targetUser,
          targetChannel: channel,
          message: newMessage,
          timestamp: new Date().toLocaleString(),
        },
      ]);
    });
  };

  const updateUserMessages = (user: string, newMessage: string) => {
    const mentions = extractMentions(newMessage);
    const messageObj: Message = {
      text: newMessage,
      user: "You",
      timestamp: new Date().toLocaleString(),
      reactions: [],
      mentions,
    };
    setMessagesByUser((prev) => ({
      ...prev,
      [user]: [...(prev[user] || []), messageObj],
    }));
    mentions.forEach((targetUser) => {
      setNotifications((prev) => [
        ...prev,
        {
          type: "mention",
          sourceUser: "You",
          targetUser,
          targetUserDM: user,
          message: newMessage,
          timestamp: new Date().toLocaleString(),
        },
      ]);
    });
  };

  const addUser = (user: string) => {
    const trimmed = user.trim();
    if (!trimmed || users.includes(trimmed)) return;
    setUsers([...users, trimmed]);
    setMessagesByUser((prev) => ({ ...prev, [trimmed]: [] }));
  };

  const deleteUser = (user: string) => {
    const updated = users.filter((u) => u !== user);
    setUsers(updated);
    setMessagesByUser((prev) => {
      const newMap = { ...prev };
      delete newMap[user];
      return newMap;
    });
    if (selectedUser === user) {
      setSelectedUser(null);
    }
  };

  const onReactMessage = (index: number, emoji: string) => {
    setMessagesByChannel((prev) => {
      const updated = [...prev[selectedChannel]];
      updated[index] = {
        ...updated[index],
        reactions: [...updated[index].reactions, emoji],
      };
      return { ...prev, [selectedChannel]: updated };
    });

    setNotifications((prev) => [
      ...prev,
      {
        type: "reaction",
        sourceUser: "You",
        targetChannel: selectedChannel,
        emoji,
        timestamp: new Date().toLocaleString(),
      },
    ]);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {currentTab === "Home" && (
        <ChannelArea
          channels={channels}
          setChannels={setChannels}
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          messages={messagesByChannel[selectedChannel] || []}
          onSendMessage={(msg) => updateMessages(selectedChannel, msg)}
          onReactMessage={onReactMessage}
        />
      )}

      {currentTab === "DM" && (
        <DMArea
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          addUser={addUser}
          deleteUser={deleteUser}
          messages={selectedUser ? messagesByUser[selectedUser] || [] : []}
          onSendMessage={(msg) => selectedUser && updateUserMessages(selectedUser, msg)}
        />
      )}

      {currentTab === "Activity" && <Activity notifications={notifications} />}

      {currentTab !== "Home" && currentTab !== "DM" && currentTab !== "Activity" && (
        <div style={{ flex: 1, padding: "2rem", backgroundColor: "#2a2c30", color: "#fff" }}>
          {currentTab === "Task" && <div>✅ タスクタブ：タスクリスト</div>}
          {currentTab === "Calendar" && <div>📅 カレンダー：予定表</div>}
          {currentTab === "Meeting" && <div>🎦 ミーティング：会議情報</div>}
        </div>
      )}
    </div>
  );
}