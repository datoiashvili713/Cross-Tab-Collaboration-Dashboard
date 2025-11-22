import React from "react";
import { User } from "../../../types";

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
    <div className="flex-shrink-0 px-4 py-2 border-t border-neutral-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f]">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
        {getTypingText()}
      </p>
    </div>
  );
};
