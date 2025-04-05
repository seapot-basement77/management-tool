// pages/workspace/join.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function WorkspaceJoin() {
  const [workspaceId, setWorkspaceId] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  const handleJoin = async () => {
    if (!workspaceId.trim()) return;

    const res = await fetch("/api/workspace/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });

    if (res.ok) {
      router.push("/workspace");
    } else {
      alert("参加に失敗しました");
    }
  };

  if (!session) {
    return <div style={{ padding: "2rem", color: "#fff" }}>ログインが必要です</div>;
  }

  return (
    <div style={{ padding: "2rem", background: "#2a2c30", color: "#fff", height: "100vh" }}>
      <h1>📩 ワークスペースに参加</h1>
      <input
        value={workspaceId}
        onChange={(e) => setWorkspaceId(e.target.value)}
        placeholder="ワークスペースIDを入力"
        style={{
          padding: "0.6rem",
          marginTop: "1rem",
          width: "300px",
          borderRadius: "6px",
          border: "none",
        }}
      />
      <br />
      <button
        onClick={handleJoin}
        style={{
          marginTop: "1rem",
          padding: "0.8rem 1.5rem",
          backgroundColor: "#43b581",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        参加する
      </button>
    </div>
  );
}
