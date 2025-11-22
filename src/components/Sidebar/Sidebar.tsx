import React from "react";

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <div className="w-[280px] h-full flex-shrink-0 flex flex-col gap-4 p-4 border-r border-neutral-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] overflow-y-auto">
      {children}
    </div>
  );
};

