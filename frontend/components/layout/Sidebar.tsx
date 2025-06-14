"use client";

import { useSession, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  LayoutDashboard,
  Package,
  FileText,
  History,
  Users,
  LogOut,
  X,
  Building2,
  BookOpen,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  session?: Session | null; // เพิ่ม session prop
  onRefreshSession?: () => void; // เพิ่ม refresh function
}

function SidebarComponent({ isOpen, onClose, session }: SidebarProps) {
  // ใช้ session จาก props แทน useSession ถ้ามี
  const { data: sessionData, status } = useSession();
  const currentSession = session || sessionData;
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Add state to prevent render issues
  const [isReady, setIsReady] = useState(false);

  // ✅ Use useEffect to handle ready state
  useEffect(() => {
    if (status !== "loading") {
      setIsReady(true);
    }
  }, [status]);

  // ✅ Show loading while not ready
  if (!isReady || status === "loading") {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ku-green mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ✅ Return null for unauthenticated users
  if (status === "unauthenticated") {
    return null;
  }

  const navigation = [
    {
      name: "แดชบอร์ด",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["USER", "APPROVER", "ADMIN"],
    },
    {
      name: "คลังครุภัณฑ์",
      href: "/inventory",
      icon: Package,
      roles: ["USER", "APPROVER", "ADMIN"],
    },
    {
      name: "จัดการคำขอ",
      href: "/requests",
      icon: FileText,
      roles: ["APPROVER", "ADMIN"],
    },
    {
      name: "ประวัติการเบิก-คืน",
      href: "/history",
      icon: History,
      roles: ["USER", "APPROVER", "ADMIN"],
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
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(session?.user?.role || "USER")
  );

  const handleSignOut = async () => {
    try {
      onClose();

      await signOut({
        redirect: false,
        callbackUrl: "/sign-in",
      });

      router.replace("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/sign-in";
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-ku-green rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">KU Asset</h1>
              <p className="text-xs text-gray-600">ระบบจัดการครุภัณฑ์</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-ku-green text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User info and logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {currentSession?.user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentSession?.user?.name}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {currentSession?.user?.email}
              </p>
              <p className="text-xs text-gray-500">
                Role: {currentSession?.user?.role}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <ErrorBoundary>
      <SidebarComponent isOpen={isOpen} onClose={onClose} />
    </ErrorBoundary>
  );
}
