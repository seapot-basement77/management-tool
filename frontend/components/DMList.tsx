import { useState } from "react";

type Props = {
  users: string[];
  selectedUser: string | null;
  setSelectedUser: (user: string) => void;
  addUser: (user: string) => void;
  deleteUser: (user: string) => void;
};

const DMList = ({ users, selectedUser, setSelectedUser, addUser, deleteUser }: Props) => {
  const [newUser, setNewUser] = useState("");

  const handleAdd = () => {
    const trimmed = newUser.trim();
    if (trimmed) {
      addUser(trimmed);
      setNewUser("");
    }
  };

  return (
    <div
      style={{
        width: "240px",
        backgroundColor: "#2f3136",
        color: "white",
        padding: "1rem",
        boxSizing: "border-box",
        borderRight: "1px solid #444",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <h3>👥 ダイレクトメッセージ</h3>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {users.map((user) => (
          <li
            key={user}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.4rem",
              borderRadius: "4px",
              backgroundColor: selectedUser === user ? "#3a3d40" : "transparent",
              cursor: "pointer",
            }}
          >
            <span onClick={() => setSelectedUser(user)}>{user}</span>
            <button
              onClick={() => deleteUser(user)}
              style={{
                background: "none",
                border: "none",
                color: "#ccc",
                cursor: "pointer",
              }}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "auto" }}>
        <input
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          placeholder="＋ ユーザー追加"
          style={{
            width: "100%",
            padding: "0.4rem",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#40444b",
            color: "white",
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            width: "100%",
            marginTop: "0.5rem",
            padding: "0.4rem",
            borderRadius: "4px",
            backgroundColor: "#7289da",
            border: "none",
            color: "white",
          }}
        >
          追加
        </button>
      </div>
    </div>
  );
};

export default DMList;
