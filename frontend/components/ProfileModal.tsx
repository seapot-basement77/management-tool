// components/ProfileModal.tsx
interface Props {
  user: string;
  onClose: () => void;
}

const ProfileModal = ({ user, onClose }: Props) => {
  return (
    <div style={{
      position: "fixed",
      top: "30%",
      left: "50%",
      transform: "translate(-50%, -30%)",
      background: "#2a2c30",
      padding: "2rem",
      borderRadius: "12px",
      color: "#fff",
      zIndex: 1000,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
    }}>
      <h2 style={{ marginBottom: "1rem" }}>🧑 {user} のプロフィール</h2>
      <p>メールアドレス: （未設定）</p>
      <p>一言: よろしくお願いします！</p>
      <button
        onClick={onClose}
        style={{
          marginTop: "1rem",
          background: "#7289da",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        閉じる
      </button>
    </div>
  );
};

export default ProfileModal;
