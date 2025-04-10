import { Dispatch, SetStateAction, useState } from "react";
import { useWorkspaceStore } from "../store/workspaceStore";

type Props = {
  currentTab: string;
  setCurrentTab: Dispatch<SetStateAction<string>>;
};

const Sidebar = ({ currentTab, setCurrentTab }: Props) => {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems = [
    { name: "Home", icon: "🏠" },
    { name: "DM", icon: "💬" },
    { name: "Task", icon: "✅" },
    { name: "Calendar", icon: "📅" },
    { name: "Meeting", icon: "🎦" },
    { name: "Activity", icon: "🔔" },
  ];

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const confirmDelete = window.confirm("本当にこのワークスペースを削除しますか？");
    if (!confirmDelete) return;

    const res = await fetch(`/api/workspace/${workspaceId}/delete`, {
      method: "DELETE",
    });

    if (res.ok) {
      const updated = workspaces.filter((ws) => ws.id !== workspaceId);
      useWorkspaceStore.setState({ workspaces: updated });

      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(updated[0] ?? null);
      }

      setIsDropdownOpen(false);
    } else {
      alert("削除に失敗しました");
    }
  };

  return (
    <div
      style={{
        width: "80px",
        height: "100vh",
        backgroundColor: "#3E0A45", // Slack風の紫色
        color: "#fff",
        padding: "1rem 0.5rem",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        position: "relative",
        overflow: "visible",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)", // シャドウ追加
      }}
    >
      {/* ワークスペースアイコン */}
      <div
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: "#5865f2", // アイコンの色
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "1.2rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          transition: "background-color 0.2s",
        }}
        title={currentWorkspace?.name}
      >
        {currentWorkspace?.name[0]?.toUpperCase() ?? "?"}
      </div>

      {/* ワークスペースドロップダウン */}
      {isDropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "80px",
            backgroundColor: "#2F3136", // ダークグレー
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            padding: "0.8rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            zIndex: 1000,
            minWidth: "200px",
          }}
        >
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: currentWorkspace?.id === ws.id ? "#5865f2" : "transparent",
                padding: "0.6rem",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              <div
                onClick={() => {
                  setCurrentWorkspace(ws);
                  setIsDropdownOpen(false);
                }}
                style={{ flex: 1 }}
              >
                {ws.name}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWorkspace(ws.id);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#bbb",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  marginLeft: "0.5rem",
                }}
                title="Delete Workspace"
              >
                ❌
              </button>
            </div>
          ))}

          {/* 作成・参加 */}
          <div
            onClick={() => {
              window.location.href = "/workspace/onboarding";
            }}
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem",
              borderRadius: "6px",
              backgroundColor: "#333",
              color: "#bbb",
              textAlign: "center",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            ➕ 新しいワークスペース
          </div>
        </div>
      )}

      {/* ナビゲーションボタン */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setCurrentTab(item.name)}
            title={item.name}
            style={{
              fontSize: "1.3rem",
              background: "transparent",
              border: "none",
              color: "#fff",
              padding: "0.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: currentTab === item.name ? "#2F3136" : "transparent",
              transition: "background-color 0.2s",
              textAlign: "center",
            }}
          >
            <div>{item.icon}</div>
            <div style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}>{item.name}</div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
