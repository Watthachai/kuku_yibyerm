"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Building2,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import Link from "next/link";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface Session {
  user?: SessionUser;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  onRefreshSession: () => void;
}

export function Sidebar({ isOpen, onClose, session }: SidebarProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 border-r border-gray-200">
          <div className="animate-pulse space-y-4 py-6">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return null;
  }

  // Navigation items
  const navigation = [
    {
      name: "แดชบอร์ด",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN"],
    },
    {
      name: "คลังครุภัณฑ์",
      href: "/products",
      icon: Package,
      roles: ["ADMIN"],
    },
    {
      name: "คำขอยืม-คืน",
      href: "/requests",
      icon: FileText,
      roles: ["ADMIN"],
    },
    {
      name: "จัดการผู้ใช้",
      href: "/management/users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      name: "จัดการหน่วยงาน",
      href: "/management/departments",
      icon: Building2,
      roles: ["ADMIN"],
    },
    {
      name: "ตั้งค่าระบบ",
      href: "/settings",
      icon: Settings,
      roles: ["ADMIN"],
    },
  ];

  // Filter navigation based on user role
  const userRole = session?.user?.role;
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole || "")
  );

  const handleSignOut = async () => {
    try {
      onClose();
      await signOut({
        redirect: true,
        callbackUrl: "/sign-in",
      });
      router.replace("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
      router.replace("/sign-in");
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          isOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={onClose}
        />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-ku-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KU</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">KU Asset</h1>
                <p className="text-xs text-gray-600">Admin Panel</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile User Info */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-ku-green rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {session?.user?.name?.charAt(0) || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "ผู้ดูแลระบบ"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {session?.user?.email}
                </p>
                <Badge variant="default" className="mt-1 text-xs">
                  ผู้ดูแลระบบ
                </Badge>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100",
                    isActive
                      ? "bg-ku-green text-white hover:bg-ku-green-dark"
                      : "text-gray-700 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t mt-auto">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col bg-white border-r border-gray-200">
          {/* Desktop Header */}
          <div className="flex h-16 shrink-0 items-center px-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-ku-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KU</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">KU Asset</h1>
                <p className="text-xs text-gray-600">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Desktop User Info */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-ku-green rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {session?.user?.name?.charAt(0) || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "ผู้ดูแลระบบ"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {session?.user?.email}
                </p>
                <Badge variant="default" className="mt-1 text-xs">
                  ผู้ดูแลระบบ
                </Badge>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 px-6 py-4">
            <div className="space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                      isActive
                        ? "bg-ku-green text-white"
                        : "text-gray-700 hover:text-ku-green hover:bg-gray-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6 shrink-0",
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-ku-green"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Desktop Footer - ปรับให้ใกล้เมนูมากขึ้น */}
          <div className="px-6 py-4 border-t">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
