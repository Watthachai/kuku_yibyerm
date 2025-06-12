"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  showLabel?: boolean;
}

const themeConfig: Record<
  Theme,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    nextTheme: Theme;
  }
> = {
  light: {
    icon: Sun,
    label: "โหมดสว่าง",
    nextTheme: "dark",
  },
  dark: {
    icon: Moon,
    label: "โหมดมืด",
    nextTheme: "system",
  },
  system: {
    icon: Monitor,
    label: "ตามระบบ",
    nextTheme: "light",
  },
};

export function ThemeToggle({
  className,
  size = "default",
  variant = "ghost",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (theme as Theme) || "system";
  const config = themeConfig[currentTheme];
  const CurrentIcon = config.icon;

  const iconSizes = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
    icon: "h-5 w-5",
  };

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("ku-border", className)}
        disabled
      >
        <Monitor className={iconSizes[size]} />
        {showLabel && <span className="ml-2">โหมดแสง</span>}
      </Button>
    );
  }

  const handleThemeChange = () => {
    setTheme(config.nextTheme);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleThemeChange}
      className={cn(
        "transition-all duration-200 ku-border hover:ku-bg-card group",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      title={`เปลี่ยนเป็น${themeConfig[config.nextTheme].label}`}
    >
      <CurrentIcon
        className={cn(
          iconSizes[size],
          "transition-transform duration-200 group-hover:scale-110"
        )}
      />
      {showLabel && (
        <span className="ml-2 text-sm font-medium">{config.label}</span>
      )}
    </Button>
  );
}
