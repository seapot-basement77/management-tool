// components/ChannelArea.tsx

import ChannelList from "./ChannelList";
import ChannelChat from "./ChannelChat";
import { Message } from "../types/Message";

interface Props {
  channels: string[];
  setChannels: (channels: string[]) => void;
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  messages: Message[];
  onSendMessage: (msg: string) => void;
  onReactMessage: (index: number, emoji: string) => void;
  currentUser: string;
  users: string[];
}

const ChannelArea = ({
  channels,
  setChannels,
  selectedChannel,
  setSelectedChannel,
  messages,
  onSendMessage,
  onReactMessage,
  currentUser,
  users,
}: Props) => {
  return (
    <>
      <ChannelList
        channels={channels}
        setChannels={setChannels}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
      />

      <ChannelChat
        selectedChannel={selectedChannel}
        messages={messages}
        onSendMessage={onSendMessage}
        onReactMessage={onReactMessage}
        currentUser={currentUser}
        users={users}
      />
    </>
  );
};

export default ChannelArea;
