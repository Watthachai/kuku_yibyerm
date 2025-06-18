import {
  AdminStats,
  RecentActivity,
  UserManagementData,
  SystemStats,
} from "@/types/admin-dashboard";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";

export class AdminDashboardService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // ⭐ แก้ไข type guard ให้ไม่ใช้ any
  private static isSessionWithTokens(
    session: Session | null
  ): session is Session {
    return (
      session !== null &&
      !!(
        session.accessToken ||
        session.refreshToken ||
        session.googleAccessToken
      )
    );
  }

  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getSession();
    console.log("🔍 Session in service:", session);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (!session?.accessToken) {
      console.warn("❌ No access token in session");

      // ⭐ ใช้ type guard แทน any
      if (this.isSessionWithTokens(session)) {
        const possibleTokens = [
          session.refreshToken,
          session.googleAccessToken,
        ].filter(Boolean);

        if (possibleTokens.length > 0) {
          console.log("🔑 Found fallback token");
          headers.Authorization = `Bearer ${possibleTokens[0]}`;
        }
      }

      return headers;
    }

    console.log("🔑 Using session access token");
    console.log(
      "🔍 Token preview:",
      session.accessToken.substring(0, 50) + "..."
    );

    headers.Authorization = `Bearer ${session.accessToken}`;
    return headers;
  }

  static async getAdminStats(): Promise<AdminStats> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}/api/v1/admin/stats`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return this.getMockStats();
    }
  }

  static async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/admin/activity?limit=${limit}`,
        {
          headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recent activity");
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return this.getMockActivity();
    }
  }

  static async getSystemStats(): Promise<SystemStats> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/admin/system-stats`,
        {
          headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch system stats");
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Error fetching system stats:", error);
      return this.getMockSystemStats();
    }
  }

  static async getUsersForManagement(
    page = 1,
    limit = 10
  ): Promise<{ users: UserManagementData[]; total: number }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/admin/users?page=${page}&limit=${limit}`,
        {
          headers,
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      return { users: this.getMockUsers(), total: 50 };
    }
  }

  static async updateUserStatus(
    userId: string,
    status: "ACTIVE" | "INACTIVE"
  ): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/admin/users/${userId}/status`,
      {
        method: "PATCH",
        headers: {
          ...headers,
        },
        body: JSON.stringify({ status }),
      }
    );
    if (!response.ok) throw new Error("Failed to update user status");
  }

  static async updateUserRole(
    userId: string,
    role: "USER" | "APPROVER" | "ADMIN"
  ): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/admin/users/${userId}/role`,
      {
        method: "PATCH",
        headers: {
          ...headers,
        },
        body: JSON.stringify({ role }),
      }
    );
    if (!response.ok) throw new Error("Failed to update user role");
  }

  private static getMockStats(): AdminStats {
    return {
      totalUsers: 89,
      totalItems: 156,
      pendingRequests: 12,
      approvedRequests: 45,
      rejectedRequests: 3,
      activeUsers: 67,
      totalDepartments: 15,
      monthlyRequests: 28,
    };
  }

  private static getMockActivity(): RecentActivity[] {
    return [
      {
        id: "1",
        type: "REQUEST",
        user: {
          id: "1",
          name: "นาย สมชาย ใจดี",
          email: "somchai@ku.ac.th",
          department: "คณะเกษตร",
        },
        item: { id: "1", name: "เครื่องฉายภาพ Epson" },
        message: "ส่งคำขอยืมเครื่องฉายภาพ Epson",
        timestamp: new Date().toISOString(),
      },
    ];
  }

  private static getMockSystemStats(): SystemStats {
    return {
      requestsByMonth: [
        { month: "ม.ค.", count: 25 },
        { month: "ก.พ.", count: 30 },
        { month: "มี.ค.", count: 28 },
      ],
      topRequestedItems: [
        { name: "เครื่องฉายภาพ", count: 15 },
        { name: "เครื่องพิมพ์", count: 10 },
      ],
      departmentUsage: [
        { department: "คณะเกษตร", count: 20 },
        { department: "คณะวิศวกรรม", count: 15 },
      ],
    };
  }

  private static getMockUsers(): UserManagementData[] {
    return [
      {
        id: "1",
        name: "นาย สมชาย ใจดี",
        email: "somchai@ku.ac.th",
        role: "USER",
        department: { id: "1", name: "คณะเกษตร" },
        status: "ACTIVE",
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        requestCount: 5,
      },
    ];
  }
}
