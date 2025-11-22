import React, { useEffect, useState } from "react";
import { User } from "../../../types";
import { UserListItem } from "./UserListItem";

interface UserListProps {
  users: User[];
  currentUserId: string;
  focusedUsers?: Record<string, number>;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  currentUserId,
  focusedUsers = {},
}) => {
  const [recentJoins, setRecentJoins] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newJoins = users
      .filter((user) => !recentJoins.has(user.id))
      .map((user) => user.id);

    if (newJoins.length > 0) {
      setRecentJoins((prev) => {
        const updated = new Set(prev);
        newJoins.forEach((id) => updated.add(id));
        return updated;
      });

      const timer = setTimeout(() => {
        setRecentJoins((prev) => {
          const updated = new Set(prev);
          newJoins.forEach((id) => updated.delete(id));
          return updated;
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [users, recentJoins]);

  const sortedUsers = [...users].sort((a, b) => b.lastActive - a.lastActive);

  return (
    <div className="flex flex-col h-[200px] md:h-[300px]">
      <div className="flex items-center justify-between gap-3 flex-shrink-0 pb-2 border-b border-neutral-200 dark:border-[#1a1a1a]">
        <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Active Users
        </h2>
        <div className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded text-xs text-neutral-600 dark:text-neutral-400">
          {users.length}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {sortedUsers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              No one here
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {sortedUsers.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                isCurrentUser={user.id === currentUserId}
                isFocused={!!focusedUsers[user.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

