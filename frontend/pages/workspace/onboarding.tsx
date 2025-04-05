// pages/onboarding.tsx
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useEffect(() => {
    const checkUserInDB = async () => {
      if (status !== "authenticated") return;

      try {
        const res = await fetch("/api/user/check", { cache: "no-store" });
        if (!res.ok) {
          console.error("❌ User check failed");
          return;
        }

        const data = await res.json();
        console.log("📝 User Check Data:", data); // ←ログ出す

        if (data.exists) {
          setIsCheckingUser(false);
        } else {
          console.log("⚠️ User not found in DB, retrying...");
          setTimeout(checkUserInDB, 500); // リトライ
        }
      } catch (error) {
        console.error("❌ Error checking user:", error);
      }
    };

    if (status === "authenticated") {
      checkUserInDB();
    } else if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading" || isCheckingUser) {
    return <div style={{ color: "#fff", padding: "2rem" }}>ロード中...</div>;
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "#2a2c30",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🚀 ワークスペースへようこそ！</h1>
      <p style={{ marginBottom: "2rem" }}>ワークスペースを作成または参加してください。</p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={() => router.push("/workspace/create")}
          style={{
            padding: "0.8rem 1.6rem",
            backgroundColor: "#7289da",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          ＋ 作成
        </button>
        <button
          onClick={() => router.push("/workspace/join")}
          style={{
            padding: "0.8rem 1.6rem",
            backgroundColor: "#43b581",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          📩 参加
        </button>
      </div>
    </div>
  );
}
