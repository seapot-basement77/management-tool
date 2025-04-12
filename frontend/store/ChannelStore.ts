// store/channelStore.ts
import { create } from "zustand";

export interface Channel {
  id: string;
  name: string;
}

interface ChannelStore {
  channels: Channel[];
  setChannels: (updater: Channel[] | ((prev: Channel[]) => Channel[])) => void;
  selectedChannel: string;
  setSelectedChannel: (channelName: string) => void;
}

export const useChannelStore = create<ChannelStore>((set) => ({
  channels: [],
  setChannels: (updater) =>
    set((state) => ({
      channels: typeof updater === "function" ? updater(state.channels) : updater,
    })),
  selectedChannel: "",
  setSelectedChannel: (channelName) => set({ selectedChannel: channelName }),
}));
