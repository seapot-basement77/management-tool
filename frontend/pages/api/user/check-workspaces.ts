// pages/api/user/check-workspaces.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ hasWorkspace: false });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { workspaces: true },
  });

  const hasWorkspace = !!user?.workspaces?.length;
  return res.status(200).json({ hasWorkspace });
}
