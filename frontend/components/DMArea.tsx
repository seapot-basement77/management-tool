// components/DMArea.tsx
import DMList from "./DMList";
import DMChat from "./DMChat";
import { Message } from "../types/Message";

interface Props {
  users: string[];
  selectedUser: string | null;
  setSelectedUser: (user: string) => void;
  addUser: (user: string) => void;
  deleteUser: (user: string) => void;
  messages: Message[];
  onSendMessage: (msg: string) => void;
  onReactMessage: (index: number, emoji: string) => void;
  currentUser: string;
}

const DMArea = ({
  users,
  selectedUser,
  setSelectedUser,
  addUser,
  deleteUser,
  messages,
  onSendMessage,
  onReactMessage,
  currentUser,
}: Props) => {
  return (
    <div style={{ display: "flex", flex: 1 }}>
      <DMList
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        addUser={addUser}
        deleteUser={deleteUser}
      />
      {selectedUser && (
        <DMChat
          user={selectedUser}
          messages={messages}
          onSendMessage={onSendMessage}
          onReactMessage={onReactMessage}
          currentUser={currentUser}
          users={users}
        />
      )}
    </div>
  );
};

export default DMArea;
