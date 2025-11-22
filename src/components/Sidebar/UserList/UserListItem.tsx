import React from "react";
import { User } from "../../../types";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "../../UserPresence/UserAvatar";

interface UserListItemProps {
  user: User;
  isCurrentUser: boolean;
  isFocused?: boolean;
}

export const UserListItem: React.FC<UserListItemProps> = React.memo(
  ({ user, isCurrentUser, isFocused = false }) => {
    return (
      <div
        className={`flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors ${
          isFocused ? "bg-blue-50 dark:bg-blue-950/20" : ""
        }`}
      >
        <UserAvatar user={user} />
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium truncate ${
                isFocused
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-neutral-900 dark:text-neutral-100"
              }`}
            >
              {user.name}
            </span>
            {isFocused && (
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
            {isCurrentUser && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded flex-shrink-0">
                you
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {formatDistanceToNow(user.lastActive, { addSuffix: true })}
          </span>
        </div>
      </div>
    );
  }
);
