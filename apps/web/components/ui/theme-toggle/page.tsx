"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider/page";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-2 transition hover:bg-surface-3"
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-brand-orange"/>
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}