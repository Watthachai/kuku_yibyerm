/* สร้างไฟล์: /Users/itswatthachai/kuku_yibyerm/frontend/features/dashboard/types/index.ts */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  avatar?: string;
  department?: string;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalItems: number;
  borrowedItems: number;
  pendingReturns: number;
  overdueItems: number;
  totalUsers?: number; // Admin only
  activeUsers?: number; // Admin only
}

export interface BorrowedItem {
  id: string;
  name: string;
  category: string;
  borrowDate: Date;
  dueDate: Date;
  status: "BORROWED" | "OVERDUE" | "RETURNED";
  borrowerName?: string; // Admin view
  borrowerEmail?: string; // Admin view
  image?: string;
}

export interface RecentActivity {
  id: string;
  type: "BORROW" | "RETURN" | "REQUEST" | "APPROVE";
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  item?: {
    name: string;
    image?: string;
  };
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: "emerald" | "blue" | "purple" | "orange";
  adminOnly?: boolean;
}

export interface DashboardData {
  user: User;
  stats: DashboardStats;
  recentItems: BorrowedItem[];
  recentActivity: RecentActivity[];
  quickActions: QuickAction[];
}
