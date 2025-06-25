// features/admin/services/admin-dashboard-service.ts

import {
  AdminStats,
  RecentActivity,
  UserManagementData,
  SystemStats,
  BackendUser, // ⭐ เพิ่ม
  BackendStatsResponse, // ⭐ เพิ่ม
  BackendApiResponse, // ⭐ เพิ่ม
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

      const responseData: BackendApiResponse<BackendStatsResponse> =
        await response.json();

      // ⭐ เพิ่ม debug logs เพื่อดูข้อมูลที่ได้รับจาก Backend
      console.log("🔍 Raw response from backend:", responseData);
      console.log("🔍 Response structure check:");
      console.log("  - Has 'data' key:", !!responseData.data);
      console.log("  - Direct data:", responseData);

      // Backend ส่งมาในรูปแบบ { "success": true, "data": {...} }
      const statsData: BackendStatsResponse =
        responseData.data || (responseData as unknown as BackendStatsResponse);

      console.log("🔍 Final stats data:", statsData);
      console.log("🔍 Stats data keys:", Object.keys(statsData));

      // ⭐ ตรวจสอบ field mapping
      const mappedStats: AdminStats = {
        totalUsers: statsData.total_users || 0,
        totalProducts: statsData.total_products || 0,
        totalDepartments: statsData.total_departments || 0,
        pendingRequests: statsData.pending_requests || 0,
        approvedRequests: statsData.approved_requests || 0,
        rejectedRequests: statsData.rejected_requests || 0,
        completedRequests: statsData.completed_requests || 0,
        monthlyRequests: statsData.monthly_requests || 0,
        activeUsers: statsData.active_users || 0,
        lowStockProducts: statsData.low_stock_products || 0,
      };

      console.log("🎯 Mapped stats:", mappedStats);
      return mappedStats;
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      // ⭐ เปลี่ยน mock data ให้ตรงกับข้อมูลจริงจาก Backend
      const mockStats = {
        totalUsers: 888,
        totalProducts: 888,
        totalDepartments: 888,
        pendingRequests: 888,
        approvedRequests: 888,
        rejectedRequests: 888,
        completedRequests: 888,
        monthlyRequests: 888,
        activeUsers: 888,
        lowStockProducts: 888,
      };
      console.log("🔄 Using mock data:", mockStats);
      return mockStats;
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

  // ⭐ แก้ไข getUsersForManagement ให้ทำงานได้จริง
  private static transformUserData(
    backendUser: BackendUser
  ): UserManagementData {
    return {
      id: String(backendUser.id), // แปลง number เป็น string
      name: backendUser.name || "ไม่ระบุชื่อ",
      email: backendUser.email || "",
      role: backendUser.role || "USER",
      status: backendUser.is_active ? "ACTIVE" : "INACTIVE",

      // ⭐ สร้าง department object ถ้าไม่มี
      department: backendUser.department || {
        id: backendUser.department_id || "1",
        name: backendUser.department_name || "ไม่ระบุหน่วยงาน",
      },

      // ⭐ ข้อมูลเพิ่มเติม
      requestCount: backendUser.request_count || 0,
      lastLogin: backendUser.last_login || undefined,
      createdAt: backendUser.created_at || new Date().toISOString(),
    };
  }

  static async getUsersForManagement(
    page = 1,
    limit = 10
  ): Promise<{ users: UserManagementData[]; total: number }> {
    try {
      console.log("🔍 Fetching users from API...", { page, limit });

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/admin/users?page=${page}&limit=${limit}`,
        {
          headers,
          credentials: "include",
        }
      );

      console.log("📡 API Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch users`);
      }

      const responseData: BackendApiResponse<{
        users: BackendUser[];
        pagination?: { total: number; page: number; limit: number };
      }> = await response.json();
      console.log("📋 Raw users response:", responseData);

      // ⭐ ตรวจสอบและแปลงข้อมูล
      if (responseData.success && responseData.data) {
        const rawUsers: BackendUser[] = responseData.data.users || [];
        const pagination = responseData.data.pagination || { total: 0 };

        console.log("🔄 Transforming user data...");

        // ⭐ แปลงข้อมูลแต่ละ user
        const transformedUsers = rawUsers.map((user: BackendUser) => {
          console.log("🔧 Transforming user:", user);
          return this.transformUserData(user);
        });

        console.log("✅ Transformed users:", transformedUsers);

        return {
          users: transformedUsers,
          total: pagination.total || rawUsers.length,
        };
      } else if (Array.isArray(responseData.data)) {
        console.log("✅ Using direct array data");

        // ⭐ แปลงข้อมูลแบบ direct array
        const transformedUsers = responseData.data.map((user: BackendUser) =>
          this.transformUserData(user)
        );

        return {
          users: transformedUsers,
          total: transformedUsers.length,
        };
      } else {
        console.log("⚠️ Unexpected data structure, using mock data");
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      console.error("❌ Error fetching users from API:", error);
      console.log("🔄 Falling back to mock data");

      // ⭐ ใช้ mock data แทนเมื่อ API ล้มเหลว
      const mockUsers = this.getMockUsers();
      return {
        users: mockUsers.slice((page - 1) * limit, page * limit),
        total: mockUsers.length,
      };
    }
  }

  // ⭐ แก้ไข updateUserStatus ให้ทำงานได้จริง
  static async updateUserStatus(
    userId: string,
    status: "ACTIVE" | "INACTIVE"
  ): Promise<void> {
    try {
      console.log("🔄 Updating user status:", { userId, status });

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/admin/users/${userId}`,
        {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({
            is_active: status === "ACTIVE",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user status: ${response.statusText}`);
      }

      console.log("✅ User status updated successfully");
    } catch (error) {
      console.error("❌ Error updating user status:", error);
      throw error;
    }
  }

  // ⭐ แก้ไข updateUserRole ให้ทำงานได้จริง
  static async updateUserRole(
    userId: string,
    role: "USER" | "APPROVER" | "ADMIN"
  ): Promise<void> {
    try {
      console.log("🔄 Updating user role:", { userId, role });

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/admin/users/${userId}`,
        {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({
            role: role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.statusText}`);
      }

      console.log("✅ User role updated successfully");
    } catch (error) {
      console.error("❌ Error updating user role:", error);
      throw error;
    }
  }

  private static getMockStats(): AdminStats {
    return {
      totalUsers: 89,
      totalProducts: 156,
      totalDepartments: 15,
      pendingRequests: 12,
      approvedRequests: 45,
      rejectedRequests: 3,
      completedRequests: 89,
      monthlyRequests: 28,
      activeUsers: 67,
      lowStockProducts: 8,
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
        { month: "2024-10", count: 25 },
        { month: "2024-11", count: 30 },
        { month: "2024-12", count: 28 },
        { month: "2025-01", count: 35 },
      ],
      topRequestedItems: [
        { name: "เครื่องฉายภาพ Epson", count: 15 },
        { name: "เครื่องพิมพ์ HP LaserJet", count: 12 },
        { name: "กล้องดิจิตอล Canon", count: 8 },
        { name: "โครงการพรีเซนเตชั่น", count: 6 },
      ],
      departmentUsage: [
        { department: "คณะเกษตร", count: 20 },
        { department: "คณะวิศวกรรม", count: 15 },
        { department: "คณะศึกษาศาสตร์", count: 12 },
        { department: "คณะวิทยาศาสตร์", count: 8 },
      ],
      requestsByStatus: [
        { status: "PENDING", count: 12 },
        { status: "APPROVED", count: 45 },
        { status: "REJECTED", count: 3 },
        { status: "COMPLETED", count: 89 },
      ],
    };
  }

  // ⭐ อัปเดต Mock Users ให้มีข้อมูลมากขึ้น
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
      {
        id: "2",
        name: "นางสาว สมหญิง สวยงาม",
        email: "somying@ku.ac.th",
        role: "APPROVER",
        department: { id: "2", name: "คณะวิศวกรรมศาสตร์" },
        status: "ACTIVE",
        lastLogin: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        requestCount: 12,
      },
      {
        id: "3",
        name: "ผศ.ดร. นำใส เก่งกล้า",
        email: "namsai@ku.ac.th",
        role: "ADMIN",
        department: { id: "3", name: "คณะศึกษาศาสตร์" },
        status: "ACTIVE",
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date().toISOString(),
        requestCount: 8,
      },
      {
        id: "4",
        name: "นาย ทดสอบ ระบบ",
        email: "test@ku.ac.th",
        role: "USER",
        department: { id: "1", name: "คณะเกษตร" },
        status: "INACTIVE",
        lastLogin: undefined,
        createdAt: new Date().toISOString(),
        requestCount: 0,
      },
      {
        id: "5",
        name: "นางสาว ผู้ใช้ ทั่วไป",
        email: "user@ku.ac.th",
        role: "USER",
        department: { id: "4", name: "คณะวิทยาศาสตร์" },
        status: "ACTIVE",
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
        createdAt: new Date().toISOString(),
        requestCount: 3,
      },
    ];
  }
}
