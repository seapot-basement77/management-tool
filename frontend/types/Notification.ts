// types/Notification.ts
export interface Notification {
  type: "reaction" | "mention";
  sourceUser: string;
  targetUser?: string;
  targetChannel?: string;
  emoji?: string;
  message?: string;
  timestamp: string;
}
