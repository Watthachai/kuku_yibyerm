import { Home, Search, ShoppingCart, FileText, User } from "lucide-react";
import type { BottomNavItem } from "@/types/navigation.types";

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  {
    id: "dashboard",
    label: "หน้าหลัก",
    icon: Home,
    href: "/dashboard",
  },
  {
    id: "catalog",
    label: "คลังครุภัณฑ์",
    icon: Search,
    href: "/products",
  },
  {
    id: "cart",
    label: "ตะกร้า",
    icon: ShoppingCart,
    href: "/cart",
  },
  {
    id: "requests",
    label: "คำขอของฉัน",
    icon: FileText,
    href: "/requests",
  },
  {
    id: "profile",
    label: "โปรไฟล์",
    icon: User,
    href: "/profile",
  },
];

export const PROTECTED_MOBILE_ROUTES = ["/cart", "/requests", "/profile"];
