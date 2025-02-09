"use client";

import { useTheme } from "next-themes";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Determine if the current theme is dark
  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div
      className="flex items-center justify-center p-2 rounded-full bg-muted-foreground dark:bg-muted cursor-pointer"
      onClick={handleToggle}
    >
      {isDark ? (
        <MdLightMode className="text-yellow-400 w-6 h-6" />
      ) : (
        <MdDarkMode className=" text-slate-700 w-6 h-6" />
      )}
    </div>
  );
}
