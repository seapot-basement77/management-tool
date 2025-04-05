// pages/api/workspace/[id]/delete.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).end(); // Method Not Allowed
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid workspace ID" });
  }

  try {
    // 削除前に存在チェック（なくてもエラーにはならないけど、念のため）
    const workspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // ワークスペース削除！
    await prisma.workspace.delete({
      where: { id },
    });

    console.log("✅ ワークスペース削除成功:", id);

    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error("❌ ワークスペース削除エラー:", error);
    res.status(500).json({ error: "Failed to delete workspace" });
  }
}
