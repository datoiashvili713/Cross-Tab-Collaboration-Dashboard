import React from "react";
import { Message, User } from "../../../types";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  message: Message;
  user: User | undefined;
  isCurrentUser: boolean;
  onDelete: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({
  message,
  user,
  isCurrentUser,
  onDelete,
}) => {
  const isExpiring = message.expiresAt
    ? message.expiresAt - Date.now() < 60000
    : false;

  const getInitials = (name: string): string => {
    const parts = name.replace(/\d+/g, "").trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getColorFromId = (id: string): string => {
    const colors = [
      "bg-neutral-600",
      "bg-neutral-500",
      "bg-neutral-700",
      "bg-neutral-400",
    ];
    const index = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {user?.name || "Unknown"}
        </span>
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </span>
      </div>
      <div className="flex items-start gap-2 group">
        <div
          className={`w-6 h-6 rounded ${getColorFromId(
            user?.id || ""
          )} flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0`}
        >
          {user?.name ? getInitials(user.name) : "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`relative inline-block px-3 py-2 rounded-md ${
              isCurrentUser
                ? "bg-[#0a0a0a] dark:bg-[#fafafa] text-[#fafafa] dark:text-[#0a0a0a]"
                : "bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100"
            } ${isExpiring ? "ring-1 ring-amber-500" : ""}`}
          >
            <p className="text-sm leading-snug whitespace-pre-wrap break-words">
              {message.text}
            </p>
            {message.expiresAt && (
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
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
    </div>
  );
});

