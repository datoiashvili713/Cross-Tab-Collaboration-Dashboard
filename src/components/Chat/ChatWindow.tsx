import React from "react";
import { Message, User } from "../../types";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  messages: Message[];
  users: User[];
  currentUserId: string;
  typingUsers: Record<string, number>;
  onSendMessage: (text: string, expiresInMs?: number) => Promise<unknown>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onTyping: () => void;
  onClearTyping: () => void;
  isLoading?: boolean;
  getUserName?: (userId: string) => string | undefined;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  users,
  currentUserId,
  typingUsers,
  onSendMessage,
  onDeleteMessage,
  onTyping,
  onClearTyping,
  isLoading = false,
  getUserName,
}) => {
  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Messages
        </h2>
      </div>
      <MessageList
        messages={messages}
        users={users}
        currentUserId={currentUserId}
        onDeleteMessage={onDeleteMessage}
        getUserName={getUserName}
      />
      <TypingIndicator
        typingUsers={typingUsers}
        users={users}
        currentUserId={currentUserId}
      />
      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onClearTyping={onClearTyping}
        disabled={isLoading}
      />
    </div>
  );
};
