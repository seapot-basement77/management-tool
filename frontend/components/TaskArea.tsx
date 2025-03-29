// components/TaskArea.tsx
import { useState, KeyboardEvent, useRef, useMemo } from "react";

interface Task {
  id: number;
  title: string;
  done: boolean;
  assignee?: string;
  dueDate?: string;
}

interface Props {
  selectedChannel: string;
  users: string[];
}

const TaskArea = ({ selectedChannel, users }: Props) => {
  const [channelTasks, setChannelTasks] = useState<Record<string, Task[]>>({});
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [mentionCandidates, setMentionCandidates] = useState<string[]>([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDueDate, setEditedDueDate] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const match = trimmed.match(/@([a-zA-Z0-9_]+)/);
    const assignee = match ? match[1] : undefined;

    const newTask: Task = {
      id: Date.now(),
      title: trimmed,
      done: false,
      assignee,
      dueDate: dueDate || undefined,
    };

    setChannelTasks((prev) => ({
      ...prev,
      [selectedChannel]: [...(prev[selectedChannel] || []), newTask],
    }));

    setInput("");
    setDueDate("");
    setShowMentionList(false);
  };

  const handleToggle = (id: number) => {
    setChannelTasks((prev) => ({
      ...prev,
      [selectedChannel]: (prev[selectedChannel] || []).map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      ),
    }));
  };

  const handleDelete = (id: number) => {
    setChannelTasks((prev) => ({
      ...prev,
      [selectedChannel]: (prev[selectedChannel] || []).filter((task) => task.id !== id),
    }));
  };

  const handleUpdate = (id: number) => {
    setChannelTasks((prev) => ({
      ...prev,
      [selectedChannel]: (prev[selectedChannel] || []).map((task) =>
        task.id === id ? { ...task, title: editedTitle, dueDate: editedDueDate } : task
      ),
    }));
    setEditingTaskId(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showMentionList && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      setMentionIndex((prev) => {
        const max = mentionCandidates.length - 1;
        if (e.key === "ArrowUp") return prev === 0 ? max : prev - 1;
        if (e.key === "ArrowDown") return prev === max ? 0 : prev + 1;
        return prev;
      });
    } else if (showMentionList && e.key === "Enter") {
      e.preventDefault();
      handleSelectMention(mentionCandidates[mentionIndex]);
    } else if (e.key === "Enter" && !e.shiftKey) {
      handleAdd();
    }
  };

  const handleChange = (value: string) => {
    setInput(value);
    const match = value.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      const partial = match[1].toLowerCase();
      const filtered = users.filter((u) => u.toLowerCase().includes(partial));
      setMentionCandidates(filtered);
      setShowMentionList(true);
      setMentionIndex(0);
    } else {
      setShowMentionList(false);
    }
  };

  const handleSelectMention = (user: string) => {
    const updated = input.replace(/@([a-zA-Z0-9_]*)$/, `@${user} `);
    setInput(updated);
    setMentionCandidates([]);
    setShowMentionList(false);
    inputRef.current?.focus();
  };

  const visibleTasks = (channelTasks[selectedChannel] || []).filter((task) =>
    filterUser ? task.assignee === filterUser : true
  );

  const sortedTasks = useMemo(() => {
    return [...visibleTasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      const aDate = new Date(a.dueDate).getTime();
      const bDate = new Date(b.dueDate).getTime();

      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    });
  }, [visibleTasks, sortOrder]);

  return (
    <div style={{ flex: 1, padding: "2rem", backgroundColor: "#2a2c30", color: "#fff" }}>
      <h2>✅ {selectedChannel} のタスク管理</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <span>👥 表示切替: </span>
        <button onClick={() => setFilterUser(null)} style={{ background: filterUser ? "#444" : "#7289da", color: "white", border: "none", padding: "0.3rem 0.8rem", borderRadius: 6 }}>全体</button>
        {users.map((user) => (
          <button
            key={user}
            onClick={() => setFilterUser(user)}
            style={{ background: filterUser === user ? "#7289da" : "#444", color: "white", border: "none", padding: "0.3rem 0.8rem", borderRadius: 6 }}
          >
            @{user}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          style={{ background: "#444", color: "#fff", border: "none", borderRadius: "6px", padding: "0.4rem 1rem", cursor: "pointer" }}
        >
          📅 期限の{sortOrder === "asc" ? "早い順" : "遅い順"}に並び替え
        </button>
      </div>

      <div style={{ position: "relative", display: "flex", gap: "1rem" }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="新しいタスクを入力（@で担当者指定）"
          style={{ flex: 1, padding: "0.5rem", borderRadius: 6, border: "none" }}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: 6, border: "none", backgroundColor: "#444", color: "#fff" }}
        />
        {showMentionList && mentionCandidates.length > 0 && (
          <ul style={{ position: "absolute", top: "2.5rem", left: 0, background: "#222", color: "white", listStyle: "none", padding: "0.5rem", borderRadius: "6px", zIndex: 10 }}>
            {mentionCandidates.map((user, i) => (
              <li
                key={user}
                onClick={() => handleSelectMention(user)}
                style={{
                  padding: "0.3rem 0.5rem",
                  cursor: "pointer",
                  background: mentionIndex === i ? "#555" : "transparent",
                }}
              >
                @{user}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul style={{ marginTop: "1.5rem", listStyle: "none", padding: 0 }}>
        {sortedTasks.map((task) => (
          <li key={task.id} style={{ borderBottom: "1px solid #444", padding: "0.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => handleToggle(task.id)}
                style={{ marginRight: "0.5rem" }}
              />
              {editingTaskId === task.id ? (
                <>
                  <input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    style={{ marginRight: "1rem", padding: "0.3rem", borderRadius: "4px", border: "none" }}
                  />
                  <input
                    type="date"
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                    style={{ marginRight: "1rem", padding: "0.3rem", borderRadius: "4px", border: "none" }}
                  />
                  <div style={{ display: "inline-flex", gap: "3rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    <button onClick={() => handleUpdate(task.id)}>保存</button>
                    <button onClick={() => setEditingTaskId(null)}>キャンセル</button>
                  </div>
                </>
              ) : (
                <>
                  <strong style={{ textDecoration: task.done ? "line-through" : "none" }}>{task.title}</strong>
                  {task.assignee && <span style={{ marginLeft: "1rem", color: "#87cefa" }}>@{task.assignee}</span>}
                  {task.dueDate && <span style={{ marginLeft: "1rem", color: "#ffa07a" }}>期限: {task.dueDate}</span>}
                </>
              )}
            </div>
            <div>
              <button
                onClick={() => {
                  setEditingTaskId(task.id);
                  setEditedTitle(task.title);
                  setEditedDueDate(task.dueDate || "");
                }}
                style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", marginRight: "0.5rem" }}
              >✏️</button>
              <button onClick={() => handleDelete(task.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer" }}>🗑</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskArea;
