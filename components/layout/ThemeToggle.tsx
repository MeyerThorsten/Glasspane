"use client";

import { useTheme } from "@/lib/theme-context";
import { RiSunLine, RiMoonLine } from "@remixicon/react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <RiSunLine className="w-5 h-5" />
      ) : (
        <RiMoonLine className="w-5 h-5" />
      )}
    </button>
  );
}
