import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isUserReady, setIsUserReady] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      if (status !== "authenticated") return;

      try {
        const res = await fetch("/api/user/check", { cache: "no-store" });
        if (!res.ok) {
          console.error("❌ ユーザーチェック失敗");
          return;
        }

        const data = await res.json();
        console.log("📝 DB User Check:", data);

        if (data.exists) {
          // もしワークスペース所属済みなら /workspace にリダイレクト
          if (session?.user.hasWorkspace) {
            console.log("✅ ワークスペースあり -> /workspace");
            router.replace("/workspace");
          } else {
            console.log("ℹ️ ワークスペースなし -> onboarding画面続行");
            setIsUserReady(true);
          }
        } else {
          console.log("⚠️ DB上にユーザー存在しない、リトライ");
          setTimeout(verifyUser, 500);
        }
      } catch (error) {
        console.error("❌ ユーザーチェックエラー:", error);
      }
    };

    if (status === "authenticated") {
      verifyUser();
    } else if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, session, router]);

  if (status === "loading" || !isUserReady) {
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
      <p style={{ marginBottom: "2rem" }}>
        ワークスペースを作成または参加してください。
      </p>
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
