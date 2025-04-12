// pages/api/channels/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const channels = await prisma.channel.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(channels);
  } catch (err) {
    console.error("🔥 チャネル一覧取得エラー:", err);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
}
