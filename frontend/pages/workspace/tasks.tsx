// pages/workspace/tasks.tsx
import { useChannelStore } from "../../store/ChannelStore";
import TaskArea from "../../components/TaskArea";
import TaskChannelList from "../../components/TaskChannelList";

const mockUsers = ["Alice", "Bob", "Charlie"];

export default function TaskPage() {
  const channels = useChannelStore((state) => state.channels);
  const selectedChannel = useChannelStore((state) => state.selectedChannel);
  const setSelectedChannel = useChannelStore((state) => state.setSelectedChannel);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <TaskChannelList
        channels={channels}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
      />
      <TaskArea selectedChannel={selectedChannel} users={mockUsers} />
    </div>
  );
}