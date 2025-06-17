export interface AdminStats {
  totalUsers: number;
  totalItems: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  activeUsers: number;
  totalDepartments: number;
  monthlyRequests: number;
}

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

export interface SystemStats {
  requestsByMonth: { month: string; count: number }[];
  topRequestedItems: { name: string; count: number }[];
  departmentUsage: { department: string; count: number }[];
}
