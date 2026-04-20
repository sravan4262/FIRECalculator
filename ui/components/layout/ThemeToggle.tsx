"use client";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

function applyTheme(dark: boolean) {
  const html = document.documentElement;
  if (dark) {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored !== "light";
    // Ensure DOM matches localStorage (covers any reconciliation that stripped the class)
    applyTheme(dark);
    setIsDark(dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    applyTheme(next);
    setIsDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {isDark === null ? (
        <Moon className="w-4 h-4" />
      ) : isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
