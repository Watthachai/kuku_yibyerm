"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="bg-white/60 hover:bg-white/80 border-gray-200/50"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/60 hover:bg-white/80 border-gray-200/50 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 dark:border-slate-700/50"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white/95 backdrop-blur-sm border-gray-200/50 dark:bg-slate-800/95 dark:border-slate-700/50"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// สำหรับปุ่มแบบ Simple (toggle เฉพาะ light/dark)
export function SimpleThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 p-0 bg-white/60">
        <div className="w-4 h-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-9 h-9 p-0 bg-white/60 hover:bg-white/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/80"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-blue-600" />
      )}
    </Button>
  );
}
