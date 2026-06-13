"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9.5 h-9.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 shadow-sm transition-all duration-300 group cursor-pointer hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun
          className={`w-4.5 h-4.5 absolute transition-all duration-500 ${
            theme === "dark"
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-amber-500"
          }`}
        />
        <Moon
          className={`w-4.5 h-4.5 absolute transition-all duration-500 ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100 text-indigo-400"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
    </button>
  );
}
