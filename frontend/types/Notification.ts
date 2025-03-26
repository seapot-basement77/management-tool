// types/Notification.ts

export type Notification = {
    type: "reaction" | "mention";
    sourceUser: string;
    timestamp: string;
    // reaction 用
    targetChannel?: string;
    emoji?: string;
    // mention 用
    targetUser?: string;
    targetUserDM?: string;
    message?: string;
  };