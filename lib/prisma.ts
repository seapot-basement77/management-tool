// management-tool/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// PrismaClientをグローバルに使い回す
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"], // ← これつけると、どんなクエリがDBに飛んだかログ出る（デバッグにめちゃ便利！）
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
