// components/UserAvatar.tsx
import { useState } from "react";
import ProfileModal from "./ProfileModal";

interface Props {
  user: string;
}

const UserAvatar = ({ user }: Props) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <span
        onClick={() => setShowProfile(true)}
        style={{
          cursor: "pointer",
          marginLeft: "0.5rem",
          fontSize: "0.9rem",
          background: "#555",
          borderRadius: "50%",
          padding: "0.2rem 0.5rem",
        }}
        title={`${user} のプロフィールを見る`}
      >
        🧑
      </span>
      {showProfile && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
};

export default UserAvatar;
