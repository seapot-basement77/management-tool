import { Notification } from "../types/Notification";

type Props = {
  notifications: Notification[];
};

const Activity = ({ notifications }: Props) => {
  return (
    <div style={{ flex: 1, padding: "2rem", backgroundColor: "#2a2c30", color: "#fff" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>🔔 通知一覧</h2>

      {notifications.length === 0 ? (
        <div style={{ color: "#bbb" }}>通知はまだありません</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map((note, index) => (
            <li
              key={index}
              style={{
                background: "#3a3d42",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              {note.type === "mention" ? (
                <>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>💬 {note.sourceUser}</strong> が <strong>@{note.targetUser}</strong> をメンション
                  </div>
                  <div style={{ fontStyle: "italic", color: "#ccc" }}>「{note.message}」</div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>👍 {note.sourceUser}</strong> が <strong>#{note.targetChannel}</strong> に {note.emoji} リアクション
                  </div>
                </>
              )}
              <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.5rem" }}>
                {note.timestamp}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Activity;
