export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalDepartments: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  completedRequests: number;
  monthlyRequests: number;
  activeUsers: number;
  lowStockProducts: number;
}

export interface SystemStats {
  requestsByMonth: { month: string; count: number }[];
  topRequestedItems: { name: string; count: number }[];
  departmentUsage: { department: string; count: number }[];
  requestsByStatus: { status: string; count: number }[]; // ⭐ เพิ่มใหม่
}

// เหมือนเดิม
export interface RecentActivity {
  id: string;
  type: "REQUEST" | "APPROVAL" | "REJECTION" | "RETURN" | "USER_CREATED";
  user: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  item?: {
    id: string;
    name: string;
  };
  message: string;
  timestamp: string;
}

export interface UserManagementData {
  id: string;
  name: string;
  email: string;
  role: "USER" | "APPROVER" | "ADMIN";
  department: {
    id: string;
    name: string;
  };
  status: "ACTIVE" | "INACTIVE";
  lastLogin?: string;
  createdAt: string;
  requestCount: number;
}

// ⭐ Backend Data Structures
export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: "USER" | "APPROVER" | "ADMIN";
  is_active: boolean;
  department_id?: string;
  department_name?: string;
  department?: {
    id: string;
    name: string;
    building?: string;
  };
  request_count?: number;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface BackendStatsResponse {
  total_users: number;
  total_products: number;
  total_departments: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  completed_requests: number;
  monthly_requests: number;
  active_users: number;
  low_stock_products: number;
}

export interface BackendApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
