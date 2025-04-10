// pages/api/workspace/list.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("🪪 セッション UserID:", session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { workspaces: true },
    });

    console.log("👤 ユーザー情報:", user);

    if (!user) {
      console.log("🔍 ユーザーが見つかりません:", session.user.id);
      return res.status(404).json({ error: "User not found" });
    }

    // 🛠ここでcreatedAtを文字列に変換する！
    const formattedWorkspaces = user.workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      createdAt: ws.createdAt.toISOString(),  // ⭐ここが超大事！
    }));

    res.status(200).json(formattedWorkspaces);
  } catch (err) {
    console.error("❌ ワークスペース一覧取得エラー:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
