"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCartStore } from "../../stores/cart.store";
import { BOTTOM_NAV_ITEMS } from "../../utils/navigation.constants";
import type { BottomNavItem } from "../../../../types/navigation.types";

interface BottomNavigationProps {
  currentPath: string;
  className?: string;
}

export function BottomNavigation({
  currentPath,
  className,
}: BottomNavigationProps) {
  const router = useRouter();
  const cartTotalItems = useCartStore((state) => state.getTotalItems());

  const isActive = (item: BottomNavItem): boolean => {
    if (item.href === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/";
    }
    return currentPath.startsWith(item.href);
  };

  const getBadgeCount = (itemId: string): number => {
    switch (itemId) {
      case "cart":
        return cartTotalItems;
      case "requests":
        return 0; // TODO: Get from requests store
      default:
        return 0;
    }
  };

  const handleNavigation = (item: BottomNavItem) => {
    router.push(item.href);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 shadow-lg",
        "safe-area-pb", // For iOS safe area
        className
      )}
    >
      <div className="grid grid-cols-5 h-16">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const badgeCount = getBadgeCount(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative rounded-lg mx-1 my-2",
                "hover:bg-white/60 active:bg-white/80 active:scale-95",
                active
                  ? "text-ku-green bg-white/40"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    active ? "text-ku-green scale-110" : "text-gray-500"
                  )}
                />
                {badgeCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center p-0 min-w-5 bg-gradient-to-r from-red-500 to-red-600 shadow-lg"
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  "text-xs transition-all duration-200",
                  active ? "text-ku-green font-semibold" : "text-gray-500"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
