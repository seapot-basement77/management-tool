import { useState } from "react";
import { useRouter } from "next/router";

const InviteMemberForm = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const workspaceId = router.query.id as string;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); // submit時のリロード防止

    if (!email.trim() || !workspaceId) return;

    console.log("✅ Inviteボタン押された", email, workspaceId); // デバッグログ

    const res = await fetch(`/api/workspace/${workspaceId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setEmail("");
      alert("メンバーが招待されました！");
    } else {
      const errorData = await res.json();
      alert(`招待失敗: ${errorData.error}`);
    }
  };

  return (
    <form onSubmit={handleInvite} style={{ padding: "1rem", backgroundColor: "#3F2A4D", borderRadius: "8px", color: "#fff" }}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="招待するメールアドレス"
        style={{
          padding: "0.6rem",
          width: "100%",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#2A1E3B",
          color: "#fff",
          marginBottom: "1rem",
        }}
      />
      <button
        type="submit" // ← ここも！
        style={{
          width: "100%",
          padding: "0.8rem",
          backgroundColor: "#43b581",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        📩 招待
      </button>
    </form>
  );
};

export default InviteMemberForm;
