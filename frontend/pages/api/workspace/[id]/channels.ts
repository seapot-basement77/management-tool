// pages/api/workspace/[id]/channels.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

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
    // まずワークスペースに所属しているか確認
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { workspaces: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMember = user.workspaces.some(ws => ws.id === workspaceId);
    if (!isMember) {
      return res.status(403).json({ error: "Forbidden: not a member of this workspace" });
    }

    // リクエストによって分岐
    if (req.method === "GET") {
      // 📄 チャネル一覧取得
      const channels = await prisma.channel.findMany({
        where: { workspaceId },
        include: { users: true },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(channels);

    } else if (req.method === "POST") {
      // ➕ 新しいチャネル作成
      const { name } = req.body;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Channel name is required" });
      }

      const newChannel = await prisma.channel.create({
        data: {
          name,
          workspace: { connect: { id: workspaceId } }, // ワークスペース紐づけ！！
          users: { connect: { id: user.id } },          // 作成者も紐づけ！！
        },
      });

      return res.status(201).json(newChannel);
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("❌ チャネル取得・作成エラー:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
