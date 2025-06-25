"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Search,
  Menu,
  Settings,
  User,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

interface HeaderProps {
  onMenuClick: () => void;
  onRefreshSession: () => void;
}

export function Header({ onMenuClick, onRefreshSession }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Desktop breadcrumb area */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            ยินดีต้อนรับ, {session?.user?.name?.split(" ")[0] || "ผู้ดูแลระบบ"}
          </h1>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Theme Toggle */}
          <ModeToggle />

          {/* Search button */}
          <Button variant="ghost" size="sm">
            <Search className="h-5 w-5 text-gray-400" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-gray-400" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center p-0"
            >
              3
            </Badge>
          </Button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <div className="w-8 h-8 bg-ku-green rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {session?.user?.name?.charAt(0) || "A"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name || "ผู้ดูแลระบบ"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>โปรไฟล์</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>ตั้งค่า</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRefreshSession}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>รีเฟรช Session</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
