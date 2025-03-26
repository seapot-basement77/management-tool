// Sidebar.tsx（更新版）

import { Dispatch, SetStateAction } from "react";

type Props = {
  currentTab: string;
  setCurrentTab: Dispatch<SetStateAction<string>>;
};

const Sidebar = ({ currentTab, setCurrentTab }: Props) => {
  const navItems = [
    { name: "Home", icon: "🏠" },
    { name: "DM", icon: "💬" },
    { name: "Task", icon: "✅" },
    { name: "Calendar", icon: "📅" },
    { name: "Meeting", icon: "🎦" },
    { name: "Activity", icon: "🔔" },
  ];

  return (
    <div style={{ width: "240px", height: "100vh", backgroundColor: "#1e1f22", color: "#fff", padding: "1.5rem 1rem", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Workspace</h2>
      <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setCurrentTab(item.name)}
            style={{
              fontSize: "1.15rem",
              background: "transparent",
              border: "none",
              color: "#fff",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              cursor: "pointer",
              backgroundColor: currentTab === item.name ? "#35363a" : "transparent",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
