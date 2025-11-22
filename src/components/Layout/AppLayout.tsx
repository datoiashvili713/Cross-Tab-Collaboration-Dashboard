import React from "react";

interface AppLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  sidebar,
  main,
  isMobileMenuOpen,
  onMobileMenuToggle,
}) => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileMenuToggle}
        />
      )}
      <div
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 transition-transform duration-200`}
      >
        {sidebar}
      </div>
      {main}
    </div>
  );
};
