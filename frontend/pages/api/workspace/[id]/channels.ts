// pages/api/workspace/[id]/channels.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { Workspace } from "../../../../types/Workspace";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized: no session" });
  }

  const { id: workspaceId } = req.query;

  if (typeof workspaceId !== "string") {
    return res.status(400).json({ error: "Invalid workspace ID" });
  }

  try {
    // ユーザー情報取得して、ワークスペースメンバーか確認
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { workspaces: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMember = user.workspaces.some((ws: Workspace) => ws.id === workspaceId);
    if (!isMember) {
      return res.status(403).json({ error: "Forbidden: not a member of this workspace" });
    }

    if (req.method === "GET") {
      // 🚫 キャッシュ禁止 → 必ず最新チャネルリストを返す！
      res.setHeader("Cache-Control", "no-store, max-age=0");

      const channels = await prisma.channel.findMany({
        where: { workspaceId },
        include: { users: true },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(channels);
    }

    if (req.method === "POST") {
      const { name } = req.body;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Channel name is required" });
      }

      const newChannel = await prisma.channel.create({
        data: {
          name,
          workspace: { connect: { id: workspaceId } },
          users: { connect: { id: user.id } },
        },
      });

      console.log("✅ チャンネル作成成功:", newChannel);

      // これも念のため no-store
      res.setHeader("Cache-Control", "no-store, max-age=0");

      return res.status(201).json(newChannel);
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("❌ チャネル取得・作成エラー:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

