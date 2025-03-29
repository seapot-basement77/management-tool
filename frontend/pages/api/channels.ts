// pages/api/channels.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const channels = await prisma.channel.findMany({
      include: { users: true },
    });
    res.status(200).json(channels);
  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
