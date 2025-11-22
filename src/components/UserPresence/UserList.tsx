import React, { useEffect, useState } from "react";
import { User } from "../../types";
import { UserAvatar } from "./UserAvatar";

interface UserListProps {
  users: User[];
  currentUserId: string;
}

export const UserList: React.FC<UserListProps> = ({ users }) => {
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Active Users
        </h2>
        <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
          {users.length}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto overflow-x-hidden scrollbar-hide">
        {sortedUsers.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No one here
            </p>
          </div>
        ) : (
          sortedUsers.map((user) => (
            <div
              key={user.id}
              className={recentJoins.has(user.id) ? "scale-[1.01]" : ""}
            >
              <UserAvatar user={user} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
