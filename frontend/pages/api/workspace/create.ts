// pages/api/workspace/create.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    console.error("❌ セッションなし");
    return res.status(401).json({ error: "Unauthorized: no session" });
  }
  if (!session.user?.email) {
    console.error("❌ セッションにemailなし", session);
    return res.status(401).json({ error: "Unauthorized: no email" });
  }

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error("❌ User not found for email:", session.user.email);
      return res.status(404).json({ error: "User not found" });
    }

    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        users: {
          connect: { id: user.id },
        },
      },
    });

    res.status(200).json(newWorkspace);
  } catch (err) {
    console.error("❌ ワークスペース作成エラー:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}