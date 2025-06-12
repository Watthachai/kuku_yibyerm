import { Users, Settings, BarChart3, Plus, Search, Bell } from "lucide-react";
import type { DashboardData, User, QuickAction } from "../types";

export const generateMockUser = (role: "ADMIN" | "USER"): User => ({
  id: "1",
  name: role === "ADMIN" ? "อ.ดร.สมชาย ใจดี" : "นางสาวใจดี รักงาน",
  email: role === "ADMIN" ? "somchai.j@ku.ac.th" : "jaidee.r@ku.ac.th",
  role,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
  department: role === "ADMIN" ? "สำนักงานอธิการบดี" : "คณะเกษตร",
  lastLogin: new Date(),
  isActive: true,
  createdAt: new Date("2023-01-15"),
});

const quickActionsData: QuickAction[] = [
  {
    id: "1",
    title: "ยืมอุปกรณ์",
    description: "ค้นหาและยืมอุปกรณ์ที่ต้องการ",
    icon: Plus,
    href: "/items/borrow",
    color: "emerald",
  },
  {
    id: "2",
    title: "ค้นหาอุปกรณ์",
    description: "ค้นหาอุปกรณ์ในระบบ",
    icon: Search,
    href: "/items/search",
    color: "blue",
  },
  {
    id: "3",
    title: "การแจ้งเตือน",
    description: "ตรวจสอบการแจ้งเตือนต่างๆ",
    icon: Bell,
    href: "/notifications",
    color: "purple",
  },
  {
    id: "4",
    title: "จัดการผู้ใช้",
    description: "จัดการบัญชีผู้ใช้ในระบบ",
    icon: Users,
    href: "/admin/users",
    color: "orange",
    adminOnly: true,
  },
  {
    id: "5",
    title: "รายงาน",
    description: "ดูรายงานสถิติการใช้งาน",
    icon: BarChart3,
    href: "/admin/reports",
    color: "purple",
    adminOnly: true,
  },
  {
    id: "6",
    title: "ตั้งค่าระบบ",
    description: "จัดการการตั้งค่าทั่วไป",
    icon: Settings,
    href: "/admin/settings",
    color: "emerald",
    adminOnly: true,
  },
];

export const generateMockDashboardData = (
  userRole: "ADMIN" | "USER"
): DashboardData => {
  const user = generateMockUser(userRole);

  const baseStats = {
    totalItems: userRole === "ADMIN" ? 1250 : 0,
    borrowedItems: userRole === "ADMIN" ? 89 : 3,
    pendingReturns: userRole === "ADMIN" ? 12 : 1,
    overdueItems: userRole === "ADMIN" ? 5 : 0,
  };

  const adminStats =
    userRole === "ADMIN"
      ? {
          totalUsers: 456,
          activeUsers: 234,
        }
      : {};

  return {
    user,
    stats: { ...baseStats, ...adminStats },
    recentItems: generateMockBorrowedItems(userRole),
    recentActivity: generateMockActivity(userRole),
    quickActions: quickActionsData.filter(
      (action) => !action.adminOnly || userRole === "ADMIN"
    ),
  };
};

const generateMockBorrowedItems = (userRole: "ADMIN" | "USER") => [
  {
    id: "1",
    name: 'MacBook Pro 14" M3',
    category: "คอมพิวเตอร์",
    borrowDate: new Date("2025-01-10"),
    dueDate: new Date("2025-01-17"),
    status: "BORROWED" as const,
    borrowerName: userRole === "ADMIN" ? "นางสาวใจดี รักงาน" : undefined,
    borrowerEmail: userRole === "ADMIN" ? "jaidee.r@ku.ac.th" : undefined,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop",
  },
  // เพิ่มข้อมูลอื่นๆ...
];

const generateMockActivity = (userRole: "ADMIN" | "USER") => [
  {
    id: "1",
    type: "BORROW" as const,
    description:
      userRole === "ADMIN"
        ? 'นางสาวใจดี รักงาน ยืม MacBook Pro 14" M3'
        : 'คุณได้ยืม MacBook Pro 14" M3',
    timestamp: new Date("2025-01-12T10:30:00"),
    user:
      userRole === "ADMIN"
        ? {
            name: "นางสาวใจดี รักงาน",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
          }
        : undefined,
    item: {
      name: 'MacBook Pro 14" M3',
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=50&h=50&fit=crop",
    },
  },
  // เพิ่มข้อมูลอื่นๆ...
];
