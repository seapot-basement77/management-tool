// store/channelStore.ts
import { create } from "zustand";

// ✅ フロント用 Channel 型（Prismaではなく手動定義）
interface Channel {
  id: string;
  name: string;
}

interface ChannelStore {
  channels: Channel[];
  selectedChannel: string;
  setChannels: (channels: Channel[]) => void;
  setSelectedChannel: (channel: string) => void;
}

export const useChannelStore = create<ChannelStore>((set) => ({
  channels: [],
  selectedChannel: "",
  setChannels: (channels) => set({ channels }),
  setSelectedChannel: (channel) => set({ selectedChannel: channel }),
}));
