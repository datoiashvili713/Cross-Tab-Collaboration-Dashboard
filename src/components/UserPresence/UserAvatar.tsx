import React from "react";
import { User } from "../../types";

interface UserAvatarProps {
  user: User;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
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
    <div
      className={`w-8 h-8 rounded ${getColorFromId(
        user.id
      )} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full rounded object-cover"
        />
      ) : (
        getInitials(user.name)
      )}
    </div>
  );
};
