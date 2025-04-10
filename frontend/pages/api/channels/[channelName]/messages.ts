import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { channelName } = req.query;
  if (typeof channelName !== "string") {
    return res.status(400).json({ error: "Invalid channel name" });
  }

  if (req.method === "GET") {
    // ⭐⭐ ここが新しく追加される！！
    try {
      const channel = await prisma.channel.findFirst({
        where: { name: channelName },
        include: {
          messages: {
            where: { parentId: null },
            include: {
              user: true,
              replies: {
                include: { user: true },
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }

      const formattedMessages = channel.messages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        user: msg.user?.name || "Unknown",
        timestamp: msg.createdAt.toISOString(),
        reactions: [],
        mentions: [],
        fileUrl: msg.fileUrl || null,
        fileType: msg.fileType || null,
        replies: (msg.replies || []).map((reply) => ({
          id: reply.id,
          text: reply.text,
          user: reply.user?.name || "Unknown",
          timestamp: reply.createdAt.toISOString(),
          reactions: [],
          mentions: [],
          fileUrl: reply.fileUrl || null,
          fileType: reply.fileType || null,
        })),
      }));

      return res.status(200).json(formattedMessages);
    } catch (error) {
      console.error("❌ GETエラー:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    // （ここはさっきまでやってたファイル送信処理そのままでOK）
    try {
      const form = formidable({ multiples: false, uploadDir: "./public/uploads", keepExtensions: true });
      const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

      const text = Array.isArray(fields.text) ? fields.text[0] : fields.text;
      const replyToMessageId = Array.isArray(fields.replyToMessageId) ? fields.replyToMessageId[0] : fields.replyToMessageId;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Invalid message text" });
      }

      const channel = await prisma.channel.findFirst({ where: { name: channelName } });
      if (!channel) return res.status(404).json({ error: "Channel not found" });

      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (!user) return res.status(404).json({ error: "User not found" });

      let fileUrl = null;
      let fileType = null;

      const file = files.file?.[0];
      if (file && file.originalFilename) {
        const newPath = path.join(process.cwd(), "public/uploads", file.originalFilename);
        await fs.rename(file.filepath, newPath);
        fileUrl = `/uploads/${file.originalFilename}`;
        fileType = file.mimetype || null;
      }

      const newMessage = await prisma.message.create({
        data: {
          text,
          userId: user.id,
          channelId: channel.id,
          parentId: replyToMessageId || null,
          fileUrl,
          fileType,
        },
        include: { user: true },
      });

      return res.status(201).json({
        id: newMessage.id,
        text: newMessage.text,
        user: newMessage.user?.name || "Unknown",
        timestamp: newMessage.createdAt.toISOString(),
        reactions: [],
        mentions: [],
        fileUrl: newMessage.fileUrl,
        fileType: newMessage.fileType,
        replies: [],
      });
    } catch (error) {
      console.error("❌ POSTエラー:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
