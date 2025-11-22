import React from "react";

export const ChatHeader: React.FC = () => {
  return (
      <div className="flex items-center justify-between gap-3 flex-shrink-0 px-4 py-3 border-b border-neutral-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f]">
      <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Messages
      </h2>
    </div>
  );
};

