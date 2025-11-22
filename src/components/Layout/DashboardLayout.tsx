import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  return (
    <div className="h-screen bg-white dark:bg-[#0a0a0a]">
      {children}
    </div>
  );
};
