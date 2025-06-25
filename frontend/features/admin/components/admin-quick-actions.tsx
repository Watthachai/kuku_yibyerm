"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw,
  Download,
  Settings,
  Plus,
  Users,
  Package,
  MoreHorizontal,
} from "lucide-react";

interface AdminQuickActionsProps {
  onRefresh: () => void;
}

export function AdminQuickActions({ onRefresh }: AdminQuickActionsProps) {
  const handleExportData = () => {
    // TODO: Implement export functionality
    console.log("Export data");
  };

  const handleAddUser = () => {
    // TODO: Implement add user modal
    console.log("Add user");
  };

  const handleAddItem = () => {
    // TODO: Implement add item modal
    console.log("Add item");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Desktop view - show all buttons */}
      <div className="hidden md:flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มข้อมูล
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleAddUser}>
              <Users className="h-4 w-4 mr-2" />
              เพิ่มผู้ใช้
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddItem}>
              <Package className="h-4 w-4 mr-2" />
              เพิ่มครุภัณฑ์
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              ส่งออกข้อมูล
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              ตั้งค่าระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile view - collapse all into one dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              เมนูจัดการ
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรชข้อมูล
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAddUser}>
              <Users className="h-4 w-4 mr-2" />
              เพิ่มผู้ใช้
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddItem}>
              <Package className="h-4 w-4 mr-2" />
              เพิ่มครุภัณฑ์
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              ส่งออกข้อมูล
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              ตั้งค่าระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}