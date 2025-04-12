// pages/workspace/create.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useWorkspaceStore } from "../../store/workspaceStore";

export default function WorkspaceCreate() {
  const [name, setName] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setWorkspaces, setCurrentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.replace("/");
    }
  }, [session, status, router]);
  
  const handleCreate = async () => {
    if (!name.trim()) return;

    const res = await fetch("/api/workspace/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const updated = await fetch("/api/workspace/list");
      if (updated.ok) {
        const data = await updated.json();
        setWorkspaces(data);
        setCurrentWorkspace(data[data.length - 1]); // 最新ワークスペースを選択
      }

      router.push("/workspace");
    } else {
      alert("作成に失敗しました");
    }
  };

  return (
    <div style={{ padding: "2rem", background: "#2a2c30", color: "#fff", height: "100vh" }}>
      <h1>🛠️ 新しいワークスペースを作成</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ワークスペース名"
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
        onClick={handleCreate}
        style={{
          marginTop: "1rem",
          padding: "0.8rem 1.5rem",
          backgroundColor: "#7289da",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        作成する
      </button>
    </div>
  );
}
