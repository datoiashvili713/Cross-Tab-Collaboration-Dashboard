export type ID = string;

export interface User {
  id: ID;
  name: string;
  avatar?: string;
  lastActive: number;
  tabId?: string;
}

export interface Message {
  id: ID;
  userId: ID;
  text: string;
  timestamp: number;
  expiresAt?: number;
  deleted?: boolean;
}

export interface CounterState {
  value: number;
  lastAction?: {
    userId: ID;
    timestamp: number;
  };
}

export type Theme = "light" | "dark";

export interface SessionAPI {
  user: User;
  users: User[];
  messages: Message[];
  counter: CounterState;
  typingUsers: Record<ID, number>;
  theme: Theme;
  focusedUsers: Record<ID, number>;
  broadcastMessages: Array<{ type: string; message: unknown }>;
  localMessages: Array<{ type: string; message: unknown }>;

  sendMessage(text: string, expiresInMs?: number): Promise<Message>;
  deleteMessage(messageId: ID): Promise<void>;
  updateCounter(delta: number): Promise<void>;
  markTyping(): void;
  clearTyping(): void;
  setTheme(theme: Theme): void;
  markFocused(): void;
  markUnfocused(): void;
  getUserName(userId: ID): string | undefined;
}
