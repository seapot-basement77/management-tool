// components/DMArea.tsx

import DMList from "./DMList";
import DMChat from "./DMChat";
import { Message } from "../types/Message";

interface Props {
  users: string[];
  selectedUser: string | null;
  setSelectedUser: (user: string | null) => void;
  addUser: (user: string) => void;
  deleteUser: (user: string) => void;
  messages: Message[];
  onSendMessage: (msg: string) => void;
}

const DMArea = ({
    users,
    selectedUser,
    setSelectedUser,
    addUser,
    deleteUser,
    messages,
    onSendMessage,
  }: Props) => {
    return (
      <>
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
            messages={messages} // ← ✅ props経由で受け取った値を使う
            onSendMessage={onSendMessage}
          />
        )}
      </>
    );
  };
  
  export default DMArea;
  