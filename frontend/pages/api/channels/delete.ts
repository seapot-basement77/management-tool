// pages/api/channels/delete.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    console.error("❌ セッションなし");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const channelId = req.query.id as string;

  if (!channelId) {
    return res.status(400).json({ error: "Channel ID is required" });
  }

  try {
    // チャンネル取得 → どのワークスペースに属しているか確認
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { workspace: true },
    });

    if (!channel) {
      console.error("❌ チャンネルが見つからない");
      return res.status(404).json({ error: "Channel not found" });
    }

    // ユーザーがそのワークスペースに属しているか確認
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { workspaces: true },
    });

    if (!user) {
      console.error("❌ ユーザーが存在しない");
      return res.status(404).json({ error: "User not found" });
    }

    const isMember = user.workspaces.some(ws => ws.id === channel.workspaceId);
    if (!isMember) {
      console.error("❌ ワークスペースに属してないから削除禁止");
      return res.status(403).json({ error: "Forbidden" });
    }

    // チャネル削除
    await prisma.channel.delete({
      where: { id: channelId },
    });

    console.log("✅ チャネル削除成功:", channelId);
    res.status(200).json({ message: "Channel deleted" });

  } catch (error) {
    console.error("🔥 チャネル削除エラー:", error);
    res.status(500).json({ error: "Failed to delete channel" });
  }
}
