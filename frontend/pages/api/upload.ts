import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable"; // ← これだけでOK！
import fs from "fs";
import path from "path";

// bodyParser無効化
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await fs.promises.mkdir(uploadDir, { recursive: true });

  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(500).json({ error: "File upload error" });
    }

    const fileData = files.file;
    if (!fileData) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = Array.isArray(fileData) ? fileData[0] : fileData;
    if (!file.filepath) {
      return res.status(400).json({ error: "Invalid file" });
    }

    const relativePath = `/uploads/${path.basename(file.filepath)}`;
    return res.status(200).json({ url: relativePath });
  });
}
