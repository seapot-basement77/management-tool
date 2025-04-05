// pages/api/channels/create.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    console.error("❌ セッションなし");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name, workspaceId } = req.body;

  if (!name || !workspaceId) {
    return res.status(400).json({ error: "Name and Workspace ID are required" });
  }

  try {
    // ユーザーがそのワークスペースに所属してるか確認
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { workspaces: true },
    });

    if (!user) {
      console.error("❌ ユーザーが存在しない");
      return res.status(404).json({ error: "User not found" });
    }

    const isMember = user.workspaces.some(ws => ws.id === workspaceId);
    if (!isMember) {
      console.error("❌ ワークスペースに所属していないため作成不可");
      return res.status(403).json({ error: "Forbidden" });
    }

    // チャネルを作成し、workspaceIdを登録
    const newChannel = await prisma.channel.create({
      data: {
        name,
        workspaceId,
        users: {
          connect: { id: user.id },
        },
      },
    });

    console.log("✅ チャネル作成成功:", newChannel);
    res.status(200).json(newChannel);

  } catch (err) {
    console.error("🔥 チャネル作成エラー:", err);
    res.status(500).json({ error: "Failed to create channel" });
  }
}
