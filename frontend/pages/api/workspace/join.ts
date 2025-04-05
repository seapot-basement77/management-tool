// pages/api/workspace/join.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const { workspaceId } = req.body;
  if (!workspaceId) return res.status(400).json({ error: "Workspace ID is required" });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        users: {
          connect: { id: user.id },
        },
      },
    });

    res.status(200).json({ message: "Workspace joined successfully" });
  } catch (err) {
    console.error("❌ ワークスペース参加エラー:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}