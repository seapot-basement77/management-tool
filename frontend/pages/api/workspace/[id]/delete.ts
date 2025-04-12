// pages/api/workspace/[id]/delete.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { Workspace } from "../../../../types/Workspace";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized: no session" });
  }

  const { id: workspaceId } = req.query;

  if (typeof workspaceId !== "string") {
    return res.status(400).json({ error: "Invalid workspace ID" });
  }

  try {
    // ワークスペース存在確認
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // ユーザーがワークスペースのメンバーか確認（セキュリティ！）
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { workspaces: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMember = user.workspaces.some((ws: Workspace) => ws.id === workspaceId);
    if (!isMember) {
      return res.status(403).json({ error: "Forbidden: not a member of workspace" });
    }

    // 💣 ワークスペースを削除！
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    console.log("✅ ワークスペース削除成功:", workspaceId);

    // キャッシュを防ぐ（おまけ）
    res.setHeader("Cache-Control", "no-store, max-age=0");

    return res.status(200).json({ message: "Workspace deleted successfully" });

  } catch (error) {
    console.error("❌ ワークスペース削除エラー:", error);
    return res.status(500).json({ error: "Failed to delete workspace" });
  }
}

