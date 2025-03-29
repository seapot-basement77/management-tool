export interface Reaction {
  user: string;
  emoji: string;
}

export interface Message {
  text: string;
  user: string;
  timestamp: string;
  reactions: Reaction[];
  mentions?: string[];
}
