import React from "react";
import { Message, User } from "../../types";
import { formatDistanceToNow } from "date-fns";

interface MessageItemProps {
  message: Message;
  user: User | undefined;
  isCurrentUser: boolean;
  onDelete: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  user,
  isCurrentUser,
  onDelete,
}) => {
  const isExpiring = message.expiresAt
    ? message.expiresAt - Date.now() < 60000
    : false;

  const getColorFromId = (id: string): string => {
    const colors = [
      "from-[#7c3aed] to-[#a855f7]",
      "from-[#059669] to-[#10b981]",
      "from-[#dc2626] to-[#ef4444]",
      "from-[#ea580c] to-[#f97316]",
      "from-[#0891b2] to-[#06b6d4]",
      "from-[#be185d] to-[#ec4899]",
      "from-[#4338ca] to-[#6366f1]",
      "from-[#0d9488] to-[#14b8a6]",
    ];
    const index = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getInitials = (name: string): string => {
    const parts = name.replace(/\d+/g, "").trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`flex gap-2.5 group ${
        isCurrentUser ? "flex-row-reverse" : ""
      }`}
    >
      <div className="flex-shrink-0">
        <div
          className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getColorFromId(
            user?.id || ""
          )} flex items-center justify-center text-white text-[10px] font-semibold`}
        >
          {user?.name ? getInitials(user.name) : "?"}
        </div>
      </div>
      <div
        className={`flex flex-col gap-1 max-w-[75%] ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
            {user?.name || "Unknown"}
          </span>
          <span className="text-[9px] text-gray-400 dark:text-gray-500">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
        <div
          className={`relative px-3 py-2 rounded-lg ${
            isCurrentUser
              ? "bg-indigo-600 dark:bg-indigo-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          } ${isExpiring ? "ring-1 ring-amber-400 dark:ring-amber-500" : ""}`}
        >
          <p className="text-sm leading-snug whitespace-pre-wrap break-words">
            {message.text}
          </p>
          {message.expiresAt && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 dark:bg-amber-500 rounded-full" />
          )}
          {isCurrentUser && (
            <button
              onClick={() => onDelete(message.id)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold"
              aria-label="Delete message"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
