import { useState, useEffect } from "react";
import ChannelList from "./ChannelList";
import ChannelChat from "./ChannelChat";
import { Channel } from "../types/Channels";
import { Message } from "../types/Message";
import { Notification } from "../types/Notification";

interface Props {
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  currentUser: string;
  users: string[];
  addNotification: (notification: Notification) => void;
}

const ChannelArea = ({
  channels,
  setChannels,
  selectedChannel,
  setSelectedChannel,
  currentUser,
  users,
  addNotification,
}: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!selectedChannel) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/channels/${selectedChannel}/messages`);
        if (res.ok) {
          const data: Message[] = await res.json();
          setMessages(data);
        } else {
          console.error("メッセージ取得エラー:", await res.json());
        }
      } catch (error) {
        console.error("メッセージ取得fetchエラー:", error);
      }
    };

    fetchMessages();
  }, [selectedChannel]);

  const handleReactMessage = async (index: number, emoji: string): Promise<"added" | "removed"> => {
    const targetMessage = messages[index];
    if (!targetMessage) return "removed";

    try {
      const res = await fetch(`/api/channels/${selectedChannel}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: targetMessage.id,
          emoji,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const action: "added" | "removed" = data.action;

        setMessages((prev) => {
          const updated = [...prev];
          const msg = updated[index];

          if (action === "added") {
            msg.reactions.push({ user: currentUser, emoji });
          } else if (action === "removed") {
            msg.reactions = msg.reactions.filter((r) => !(r.user === currentUser && r.emoji === emoji));
          }

          return updated;
        });

        return action;
      } else {
        console.error("リアクションエラー:", await res.json());
        return "removed";
      }
    } catch (error) {
      console.error("リアクション送信エラー:", error);
      return "removed";
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <ChannelList
        channels={channels}
        setChannels={setChannels}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
      />
      <ChannelChat
        selectedChannel={selectedChannel}
        messages={messages}
        onReactMessage={handleReactMessage}
        currentUser={currentUser}
        users={users}
        addNotification={addNotification}
      />
    </div>
  );
};

export default ChannelArea;
