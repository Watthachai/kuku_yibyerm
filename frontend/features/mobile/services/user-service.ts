import { getAuthHeaders, getAuthHeadersForFormData } from "@/lib/api";

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  provider: string;
  provider_id: string;
  department_id?: number | null; // Backend ส่งมาเป็น number หรือ null/undefined
  department?: {
    id: string;
    name: string;
    code: string;
    type: "FACULTY" | "DIVISION" | "INSTITUTE" | "CENTER" | "OFFICE";
    parent_id?: number | null;
    faculty?: string; // ชื่อคณะ (ถ้าเป็นภาควิชา)
    building?: string;
  };
  role: "USER" | "ADMIN";
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  department_id?: number | null; // เปลี่ยนจาก string เป็น number เพื่อให้ตรงกับ backend (uint)
}

export interface UserStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  borrowedItems: number;
  completedRequests: number;
}

class UserService {
  private baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1";

  // Get current user profile
  async getCurrentUser(): Promise<UserProfile> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("=== API RESPONSE DEBUG ===");
      console.log("Raw API response:", result);
      console.log("result.data:", result.data);
      console.log("result.data?.department_id:", result.data?.department_id);
      console.log("==========================");
      // Backend ส่งมาเป็น { success: true, data: user }
      return result.data || result;
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: "PATCH", // เปลี่ยนจาก PUT เป็น PATCH
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Update profile response:", result);
      // Backend ส่งมาเป็น { success: true, message: "...", data: user }
      return result.data || result;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(): Promise<UserStats> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/profile/stats`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Failed to get user stats:", error);
      // Return mock stats if API fails
      return this.getMockUserStats();
    }
  }

  // Mock user stats for development
  private getMockUserStats(): UserStats {
    // Mock data ให้ตรงกับ dashboard ที่แสดงใน screenshot
    return {
      totalRequests: 4, // รายการคำขอทั้งหมด
      pendingRequests: 3, // รออนุมัติ
      approvedRequests: 1, // อนุมัติแล้ว
      rejectedRequests: 0, // ถูกปฏิเสธ
      borrowedItems: 0, // กำลังยืม (ไม่มี)
      completedRequests: 1, // เสร็จสิ้น (เท่ากับ approved สำหรับ demo)
    };
  }

  // Upload avatar (if needed for future)
  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    try {
      const headers = await getAuthHeadersForFormData();
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`${this.baseUrl}/auth/avatar`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      throw error;
    }
  }
}

export const userService = new UserService();
