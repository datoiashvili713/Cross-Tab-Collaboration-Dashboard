import React from "react";
import { Menu, X } from "lucide-react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  isOpen,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md border border-neutral-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors shadow-sm dark:shadow-none"
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <X className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
      ) : (
        <Menu className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
      )}
    </button>
  );
};
