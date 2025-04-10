import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (status === "loading") return; // ローディング中は何もしない

    if (status === "authenticated") {
      // ログイン済みの場合、ワークスペースに所属しているかを確認
      const checkUserWorkspaces = async () => {
        try {
          // APIでユーザーのワークスペース情報を確認
          const res = await fetch("/api/user/check-workspaces");
          const data = await res.json();

          // 所属しているワークスペースがあれば、workspaceに遷移
          if (data.hasWorkspace) {
            router.push("/workspace"); // 所属していればワークスペースに遷移
          } else {
            router.push("/workspace/onboarding"); // 所属していなければonboardingに遷移
          }
        } catch (error) {
          console.error("ユーザーのワークスペース確認エラー:", error);
          router.push("/workspace/onboarding");
        } finally {
          setIsRedirecting(false); // リダイレクト処理完了
        }
      };

      checkUserWorkspaces();
    } else {
      setIsRedirecting(false); // ログインしていない場合もリダイレクトしない
    }
  }, [status, router]);

  if (isRedirecting) {
    return <div style={{ color: "#fff", padding: "2rem" }}>ロード中...</div>;
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        color: "#fff",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "3rem",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        {!session ? (
          <>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              🚀 チームのためのワークスペースへようこそ！
            </h1>
            <p style={{ marginBottom: "2rem" }}>
              Googleアカウントでログインして始めよう
            </p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
              style={{
                padding: "0.8rem 1.6rem",
                backgroundColor: "#fff",
                color: "#333",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Googleでログイン
            </button>
          </>
        ) : (
          <>
            <h2>👋 こんにちは、{session.user?.name} さん！</h2>
            <p>{session.user?.email}</p>
            <button
              onClick={() => signOut()}
              style={{
                marginTop: "1.5rem",
                padding: "0.6rem 1.2rem",
                backgroundColor: "#eee",
                color: "#333",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ログアウト
            </button>
          </>
        )}
      </div>
    </div>
  );
}
