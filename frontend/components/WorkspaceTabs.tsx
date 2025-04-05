// components/WorkspaceTabs.tsx
import { useWorkspaceStore } from "../store/workspaceStore";

export default function WorkspaceTabs() {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  if (workspaces.length === 0) return null;

  return (
    <div style={{ display: "flex", background: "#1e1f22", padding: "0.5rem" }}>
      {workspaces.map((ws) => (
        <button
          key={ws.id}
          onClick={() => setCurrentWorkspace(ws)}
          style={{
            marginRight: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: currentWorkspace?.id === ws.id ? "#7289da" : "#2a2c30",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {ws.name}
        </button>
      ))}
    </div>
  );
}
