import { Notification } from "../types/Notification";

type Props = {
  notifications: Notification[];
};

const Activity = ({ notifications }: Props) => {
  return (
    <div style={{ flex: 1, padding: "2rem", backgroundColor: "#2a2c30", color: "#fff" }}>
      🔔 通知一覧
      <ul>
        {notifications.map((note, index) => (
          <li key={index} style={{ marginBottom: "1rem" }}>
            {note.type === "mention" && (
              <>
                <strong>{note.sourceUser}</strong> が <strong>@{note.targetUser}</strong> をメンション：
                <br />
                <em>「{note.message}」</em>
                <div style={{ fontSize: "0.8rem", color: "#ccc" }}>{note.timestamp}</div>
              </>
            )}
            {note.type === "reaction" && (
              <>
                <strong>{note.sourceUser}</strong> が <strong>#{note.targetChannel}</strong> に {note.emoji} リアクション
                <div style={{ fontSize: "0.8rem", color: "#ccc" }}>{note.timestamp}</div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Activity;
