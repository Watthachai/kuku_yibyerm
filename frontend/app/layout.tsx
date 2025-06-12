import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/provider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "YibYerm - ระบบจัดการการยืม-คืน",
    template: "%s | YibYerm",
  },
  description:
    "ระบบจัดการการยืม-คืนอุปกรณ์และทรัพยากรศึกษา สำหรับบุคลากรมหาวิทยาลัยเกษตรศาสตร์",
  keywords: ["ยืม-คืน", "มหาวิทยาลัยเกษตรศาสตร์", "KU", "อุปกรณ์"],
  authors: [
    {
      name: "Itswatthachai",
      url: "https://github.com/itswatthachai",
    },
  ],
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#10b981" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased font-sans min-h-screen bg-background text-foreground",
          "transition-colors duration-300"
        )}
      >
        <ThemeProvider
          defaultTheme="system"
          enableSystem
          storageKey="ku-yibyerm-theme"
        >
          <Providers>
            <div className="relative min-h-screen">{children}</div>
            <Toaster position="top-right" richColors closeButton />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
