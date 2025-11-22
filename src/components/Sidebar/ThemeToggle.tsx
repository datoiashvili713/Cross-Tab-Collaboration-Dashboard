import React from "react";
import { Moon, Sun } from "lucide-react";
import { Theme } from "../../types";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-neutral-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
      ) : (
        <Sun className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
      )}
      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
        {theme === "light" ? "Dark" : "Light"}
      </span>
    </button>
  );
};

