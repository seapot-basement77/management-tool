// pages/api/channels/delete.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).end(); // Method Not Allowed
  }

  const channelId = req.query.id as string;

  if (!channelId) {
    return res.status(400).json({ error: "Channel ID is required" });
  }

  try {
    // チャネルの削除（リレーションも自動で処理）
    await prisma.channel.delete({
      where: { id: channelId },
    });

    res.status(200).json({ message: "Channel deleted" });
  } catch (err) {
    console.error("🔥 チャネル削除エラー:", err);
    res.status(500).json({ error: "Failed to delete channel" });
  }
}
