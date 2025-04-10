// pages/api/channels/create.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { Workspace } from "../../../types/Workspace";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name, workspaceId } = req.body;

  if (!name || !workspaceId) {
    return res.status(400).json({ error: "Name and Workspace ID are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { workspaces: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMember = user.workspaces.some((ws: Workspace) => ws.id === workspaceId);
    if (!isMember) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const newChannel = await prisma.channel.create({
      data: {
        name,
        workspaceId,
        users: { connect: { id: user.id } },
      },
      select: { id: true, name: true }, // ← 作成直後に返すフィールドを絞る！！
    });

    console.log("✅ チャネル作成成功:", newChannel);
    return res.status(201).json(newChannel); // ← 200じゃなくて201がベター
  } catch (err) {
    console.error("🔥 チャネル作成エラー:", err);
    return res.status(500).json({ error: "Failed to create channel" });
  }
}

