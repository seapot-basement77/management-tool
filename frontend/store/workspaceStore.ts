// store/workspaceStore.ts
import { create } from "zustand";

export interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceStore {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setWorkspaces: (ws: Workspace[]) => void;
  setCurrentWorkspace: (ws: Workspace) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  currentWorkspace: null,
  setWorkspaces: (ws) => set({
    workspaces: ws,
    currentWorkspace: ws[0] ?? null, // ← ここで初期選択もセット
  }),
  setCurrentWorkspace: (ws) => set({ currentWorkspace: ws }),
}));

