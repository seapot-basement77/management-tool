export interface Reaction {
  user: string;
  emoji: string;
}

export interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: string;
  reactions: { user: string; emoji: string }[];
  mentions: string[];
  fileUrl?: string | null;  // 👈 追加！
  fileType?: string | null; // 👈 追加！
  replyTo?: {
    id: string;
    user: string;
    text: string;
  };
  replies?: Message[];      // 👈 追加！（スレッド型もちゃんと持つ）
}
