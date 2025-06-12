/* แก้ไขไฟล์: /Users/itswatthachai/kuku_yibyerm/frontend/components/theme-provider.tsx */
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

type Theme = "light" | "dark" | "system";

interface KUThemeProviderProps
  extends Omit<
    ThemeProviderProps,
    "attribute" | "defaultTheme" | "enableSystem"
  > {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "ku-yibyerm-theme",
  ...props
}: KUThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch by rendering a placeholder
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      storageKey={storageKey}
      themes={["light", "dark", "system"]}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
