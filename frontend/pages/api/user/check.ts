import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ exists: false });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // ここ！！！！！
    if (!user) {
      console.log("⚡ DBにユーザーがいないので新規作成する:", session.user.email);
      user = await prisma.user.create({
        data: {
          name: session.user.name ?? "No Name",
          email: session.user.email,
          image: session.user.image,
        },
      });
    }

    return res.status(200).json({ exists: true });
  } catch (error) {
    console.error("❌ Userチェックエラー:", error);
    return res.status(500).json({ exists: false });
  }
}
