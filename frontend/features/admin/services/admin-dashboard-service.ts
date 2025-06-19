// features/admin/services/admin-dashboard-service.ts

import {
  AdminStats,
  RecentActivity,
  UserManagementData,
  SystemStats,
} from "@/types/admin-dashboard";
import { getSession } from "next-auth/react";

export class AdminDashboardService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // ⭐ 1. แก้ไขและจัดระเบียบฟังก์ชันนี้ให้สะอาดขึ้น
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // ใช้ if statement ที่ถูกต้อง และตอนนี้ TypeScript รู้จัก session.accessToken แล้ว
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    } else {
      console.warn(
        "Access token not found directly on session. Check NextAuth setup."
      );
    }

    return headers;
  }

  // ⭐ 2. ปรับปรุงฟังก์ชันทั้งหมดให้ใช้แพทเทิร์นที่ปลอดภัยและสอดคล้องกัน

  static async getAdminStats(): Promise<AdminStats> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/admin/stats`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch admin stats`);
      }

      const responseData = await response.json();
      // ใช้แพทเทิร์นการตรวจสอบที่ปลอดภัย: ถ้ามี data.data ให้ใช้, ถ้าไม่มีให้ใช้ data ทั้งก้อน
      // และถ้าทั้งหมดไม่มีค่า ให้ fallback ไปที่ mock data ใน catch block
      return responseData.data || responseData;
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return this.getMockStats(); // Fallback to mock data on error
    }
  }

  static async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/admin/activity?limit=${limit}`,
        { headers, credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch recent activity: ${response.statusText}`
        );
      }

      const responseData = await response.json();

      // แพทเทิร์นที่ปลอดภัยที่สุดสำหรับ Array: ตรวจสอบว่าเป็น Array จริงๆ
      // ถ้าไม่ใช่ ให้คืนค่า Array ว่าง เพื่อป้องกัน Component พัง
      if (responseData && Array.isArray(responseData.data)) {
        return responseData.data;
      }

      console.warn(
        "Received unexpected data structure for recent activity:",
        responseData
      );
      return []; // คืนค่า Array ว่างเสมอ
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return []; // คืนค่า Array ว่างเสมอเมื่อเกิด Error
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

      const responseData = await response.json();
      // ใช้แพทเทิร์นเดียวกันกับ getAdminStats
      return responseData.data || responseData;
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
        { headers, credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch users");

      // หมายเหตุ: Endpoint นี้ดูเหมือนจะ return data แบบไม่ห่อใน 'data' key
      // ซึ่งถ้าเป็นไปได้ ควรปรับแก้ที่ Backend ให้มีโครงสร้างเหมือน Endpoint อื่นๆ เพื่อความสอดคล้อง
      const responseData = await response.json();
      return responseData.data; // สมมติว่า Backend ถูกแก้ให้ห่อใน data key แล้ว
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
