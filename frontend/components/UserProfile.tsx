// components/UserProfile.tsx
import { useState } from "react";
import { useSession } from "next-auth/react";

const UserProfile = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("🟢 オンライン");
  const [bio, setBio] = useState("よろしくお願いします！");
  const [name, setName] = useState(user?.name || "");

  const handleSave = () => {
    setIsEditing(false);
    // TODO: 保存処理（バックエンド連携）
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || "");
    setBio("よろしくお願いします！");
    setStatus("🟢 オンライン");
  };

  return (
    <div style={{ padding: "2rem", color: "#fff", backgroundColor: "#2a2c30", minHeight: "100vh" }}>
      <h2>👤 プロフィール</h2>

      <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
        <img src={user?.image || ""} alt="user" style={{ borderRadius: "50%", width: 80, height: 80, marginRight: "1rem" }} />
        {isEditing ? (
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ fontSize: "1.2rem", padding: "0.5rem" }} />
        ) : (
          <h3>{user?.name}</h3>
        )}
      </div>

      <p style={{ marginTop: "1rem" }}>
        ✉️ {user?.email}
      </p>

      <div style={{ marginTop: "1rem" }}>
        <strong>ステータス:</strong>{" "}
        {isEditing ? (
          <input value={status} onChange={(e) => setStatus(e.target.value)} />
        ) : (
          status
        )}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <strong>自己紹介:</strong>
        <br />
        {isEditing ? (
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} style={{ width: "100%" }} />
        ) : (
          <p>{bio}</p>
        )}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        {isEditing ? (
          <>
            <button onClick={handleSave} style={{ marginRight: "1rem", padding: "0.5rem 1rem", background: "#7289da", color: "#fff", border: "none", borderRadius: "6px" }}>保存</button>
            <button onClick={handleCancel} style={{ padding: "0.5rem 1rem", background: "#aaa", border: "none", borderRadius: "6px" }}>キャンセル</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} style={{ padding: "0.5rem 1rem", background: "#7289da", color: "#fff", border: "none", borderRadius: "6px" }}>編集</button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
