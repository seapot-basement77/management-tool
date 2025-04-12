import { useState } from "react";

export default function TestPage() {
  const [inputValue, setInputValue] = useState("");

  const handleClick = async () => {
    console.log("✅ ボタン押された:", inputValue);

    const res = await fetch("/api/hello"); // なんでもいい（ダミー）
    console.log("✅ fetchリクエスト送信", res.status);
  };

  return (
    <div style={{ padding: "3rem", background: "#111", color: "#fff" }}>
      <h1>テストページ</h1>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="入力してみて"
        style={{ marginRight: "1rem", padding: "0.5rem" }}
      />
      <button
        onClick={handleClick}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#5865f2",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        送信
      </button>
    </div>
  );
}
