import React from "react";

interface MainProps {
  children: React.ReactNode;
}

export const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <div className="flex-1 flex flex-col gap-4 p-3 md:p-4 pt-14 md:pt-4 bg-white dark:bg-[#0a0a0a] overflow-y-auto">
      {children}
    </div>
  );
};

