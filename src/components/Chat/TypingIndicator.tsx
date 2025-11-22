import React from "react";
import { User } from "../../types";

interface TypingIndicatorProps {
  typingUsers: Record<string, number>;
  users: User[];
  currentUserId?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  users,
  currentUserId,
}) => {
  const typingUserIds = Object.keys(typingUsers).filter(
    (id) => id !== currentUserId
  );
  const typingUserObjects = users.filter((user) =>
    typingUserIds.includes(user.id)
  );

  if (typingUserObjects.length === 0) {
    return null;
  }

  const getTypingText = (): string => {
    if (typingUserObjects.length === 1) {
      return `${typingUserObjects[0].name} is typing...`;
    } else if (typingUserObjects.length === 2) {
      return `${typingUserObjects[0].name} and ${typingUserObjects[1].name} are typing...`;
    } else {
      return `${typingUserObjects[0].name} and ${typingUserObjects.length - 1} others are typing...`;
    }
  };

  return (
    <div className="px-3 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          {getTypingText()}
        </p>
      </div>
    </div>
  );
};
