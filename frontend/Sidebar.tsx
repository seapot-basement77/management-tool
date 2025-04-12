// frontend/components/Sidebar.tsx

import Link from "next/link";

const Sidebar = () => {
  return (
    <div style={{ width: "200px", padding: "1rem", background: "#f4f4f4" }}>
      <h2>Workspace</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link href="/workspace/chat">💬 チャット</Link></li>
        <li><Link href="/workspace/tasks">✅ タスク管理</Link></li>
        <li><Link href="/workspace">🏠 ホーム</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar; // ←★これが超重要！
