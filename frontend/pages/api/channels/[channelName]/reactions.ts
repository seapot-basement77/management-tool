//api/channel/[channeklName]/reactions.ts]
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { channelName } = req.query;

  if (typeof channelName !== "string") {
    return res.status(400).json({ error: "Invalid channel name" });
  }

  if (req.method === "POST") {
    const { messageId, emoji } = req.body;

    if (!messageId || !emoji) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const existingReaction = await prisma.reaction.findFirst({
        where: {
          userId: user.id,
          messageId,
          emoji,
        },
      });

      if (existingReaction) {
        // リアクション削除
        await prisma.reaction.delete({
          where: { id: existingReaction.id },
        });
      
        console.log("✅ Reaction removed:", existingReaction.id);
      } else {
        // リアクション追加
        await prisma.reaction.create({
          data: {
            emoji,
            userId: user.id,
            messageId,
          },
        });
      
        console.log("✅ Reaction added");
      }
      
      // ✅ リアクションは別テーブルだから、メッセージ側を無理にupdateしない！
      
      return res.status(200).json({ action: existingReaction ? "removed" : "added" });
      

    } catch (error) {
      console.error("リアクション送信エラー:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
