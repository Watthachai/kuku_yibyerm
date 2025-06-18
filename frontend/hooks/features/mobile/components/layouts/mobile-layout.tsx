"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { BottomNavigation } from "./bottom-navigation";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export function MobileLayout({ 
  children, 
  showBottomNav = true,
  className 
}: MobileLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Only show mobile layout for USER role
  if (session?.user?.role !== "USER") {
    return <>{children}</>;
  }

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Main Content */}
      <main className={cn(
        "relative",
        showBottomNav && "pb-20" // Add bottom padding when bottom nav is shown
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNavigation currentPath={pathname} />
      )}
    </div>
  );
}