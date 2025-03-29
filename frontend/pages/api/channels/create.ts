import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    console.log("❌ セッション情報なし:", session);
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name } = req.body;

  try {
    console.log("📨 セッション情報:", session);
    console.log("📨 リクエストボディ:", req.body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log("❌ 該当ユーザーが見つかりません:", session.user.email);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ ユーザー情報:", user);

    const newChannel = await prisma.channel.create({
      data: {
        name,
        users: {
          connect: { id: user.id },
        },
      },
    });

    console.log("✅ 新しいチャネル作成成功:", newChannel);
    res.status(200).json(newChannel);

  } catch (err) {
    console.error("🔥 チャネル作成中にエラー:", err);
    res.status(500).json({ error: "Failed to create channel" });
  }
}
