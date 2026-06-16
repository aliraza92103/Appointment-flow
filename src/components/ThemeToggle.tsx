import { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("appointflow_theme") === "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add("light");
      root.classList.remove("dark");
      localStorage.setItem("appointflow_theme", "light");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("appointflow_theme", "dark");
    }
  }, [isLight]);

  return (
    <button
      onClick={() => setIsLight(!isLight)}
      className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 glass-button-secondary text-inherit transition-all duration-300 relative group flex items-center justify-center cursor-pointer"
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      aria-label="Theme toggle button"
      id="theme-toggle-control"
    >
      <div className="absolute inset-0 rounded-xl bg-emerald-500/5 filter blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
      {isLight ? (
        <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 nav-icon action-icon" weight="duotone" />
      ) : (
        <Sun className="w-4 h-4 text-emerald-600 dark:text-emerald-400 nav-icon action-icon" weight="duotone" />
      )}
    </button>
  );
}
