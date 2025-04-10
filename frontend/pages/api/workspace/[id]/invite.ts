import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized: no session" });
  }

  const { id: workspaceId } = req.query;
  const { email } = req.body;

  if (typeof workspaceId !== "string" || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ error: "Invalid input: workspaceId or email" });
  }

  try {
    // 📩 招待するユーザーを探す
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🚧 すでにそのワークスペースに所属していないかチェック
    const alreadyJoined = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        users: {
          some: { id: invitedUser.id },
        },
      },
    });

    if (alreadyJoined) {
      return res.status(400).json({ error: "Already a member of this workspace" });
    }

    // ➕ ワークスペースにユーザーを追加する
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        users: {
          connect: { id: invitedUser.id },
        },
      },
    });

    console.log(`✅ ユーザー (${email}) をワークスペース(${workspaceId})に招待成功`);
    
    // キャッシュ防止
    res.setHeader("Cache-Control", "no-store, max-age=0");

    return res.status(200).json({ message: "User invited successfully" });

  } catch (err) {
    console.error("🔥 メンバー招待エラー:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
