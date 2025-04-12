// types/PrismaFetchedMessage.ts

export interface PrismaFetchedMessage {
    id: string;
    text: string;
    createdAt: Date;
    fileUrl?: string | null;
    fileType?: string | null;
    user: { name: string } | null;
    replies?: {
      id: string;
      text: string;
      createdAt: Date;
      fileUrl?: string | null;
      fileType?: string | null;
      user: { name: string } | null;
    }[];
  }