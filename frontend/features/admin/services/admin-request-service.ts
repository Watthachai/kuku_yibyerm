import { getSession } from "next-auth/react";
import {
  BorrowRequest,
  ApprovalAction,
  RequestStatus,
} from "@/features/shared/types/request.types";

interface BackendDepartment {
  id?: number;
  name_th?: string;
  name?: string;
  code?: string;
  type?: string;
  parent_id?: number;
  faculty?: string; // เพิ่ม field faculty
}

interface BackendRequestItem {
  id?: number | string;
  product?: {
    id?: number | string;
    name?: string;
    code?: string;
    category?: {
      name?: string;
    };
  };
  product_id?: number | string;
  quantity?: number;
  purpose?: string;
  notes?: string;
}

interface BackendRequest {
  id?: number | string;
  request_number?: string;
  user?: {
    id?: number | string;
    name?: string;
    email?: string;
    department?: BackendDepartment; // ✅ FIXED: ใช้ BackendDepartment type ที่อัปเดตแล้ว
  };
  user_id?: number | string;
  items?: BackendRequestItem[];
  purpose?: string;
  notes?: string;
  status?: string;
  request_date?: string;
  approved_date?: string;
  issued_date?: string;
  completed_date?: string;
  admin_note?: string;
  created_at?: string;
  updated_at?: string;
  approved_by_id?: number | string;
  approved_by?: {
    name?: string;
  };
}

export class AdminRequestService {
  private static baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  // ⭐ ดึงคำขอทั้งหมดสำหรับ Admin
  static async getAllRequests(): Promise<BorrowRequest[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/admin/requests`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const responseData = await response.json();
      console.log("🔍 Admin requests response:", responseData);

      // ⭐ แก้ไขการดึงข้อมูล - Backend ส่งมาเป็น { data: { requests: [...] } }
      let requestsArray = [];

      if (
        responseData.data &&
        responseData.data.requests &&
        Array.isArray(responseData.data.requests)
      ) {
        // กรณี Backend ส่งมาเป็น { data: { requests: [...] } }
        requestsArray = responseData.data.requests;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // กรณี Backend ส่งมาเป็น { data: [...] }
        requestsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        // กรณี Backend ส่งมาเป็น [...] โดยตรง
        requestsArray = responseData;
      } else {
        console.warn("Unexpected response structure:", responseData);
        return [];
      }

      console.log("🔍 Array length:", requestsArray.length);

      // แปลงข้อมูลจาก Backend ให้ตรงกับ Frontend
      const requests = requestsArray.map(
        (req: BackendRequest): BorrowRequest => {
          console.log("🔍 Processing request:", req);

          return {
            id: req.id?.toString() || "0",
            requestNumber: req.request_number || `REQ-${req.id}`,
            user: {
              id: req.user?.id?.toString() || req.user_id?.toString() || "0",
              name: req.user?.name || "ไม่ระบุ",
              email: req.user?.email || "",
              department: req.user?.department
                ? {
                    id: req.user.department.id || 0,
                    name:
                      req.user.department.name ||
                      req.user.department.name_th ||
                      req.user.department.code ||
                      "ไม่ระบุหน่วยงาน",
                    code: req.user.department.code,
                    faculty: req.user.department.faculty,
                  }
                : undefined,
            },
            items: (req.items || []).map((item: BackendRequestItem) => ({
              id: item.id?.toString() || Math.random().toString(),
              product: {
                id:
                  item.product?.id?.toString() ||
                  item.product_id?.toString() ||
                  "0",
                name: item.product?.name || "ไม่ระบุสินค้า",
                code: item.product?.code || "",
                category: item.product?.category?.name || "",
              },
              quantity: item.quantity || 0,
              purpose: item.purpose || "",
              notes: item.notes || "",
            })),
            purpose: req.purpose || "",
            notes: req.notes || "",
            status: (req.status || "PENDING") as RequestStatus,
            requestDate: req.request_date || req.created_at || "",
            approvedDate: req.approved_date,
            issuedDate: req.issued_date,
            completedDate: req.completed_date,
            adminNote: req.admin_note || "",
            createdAt: req.created_at || "",
            updatedAt: req.updated_at || "",

            // Admin info
            approvedBy: req.approved_by_id
              ? {
                  id: req.approved_by_id.toString(),
                  name: req.approved_by?.name || "ผู้ดูแลระบบ",
                  approvedAt: req.approved_date || new Date().toISOString(),
                }
              : undefined,
          };
        }
      );

      console.log("✅ Processed requests:", requests);
      return requests;
    } catch (error) {
      console.error("Error fetching admin requests:", error);
      throw error;
    }
  }

  // ⭐ อนุมัติ/ปฏิเสธคำขอ
  static async updateRequestStatus(
    requestId: string,
    action: ApprovalAction
  ): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/admin/requests/${requestId}/status`,
        {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({
            status: action.action === "APPROVE" ? "APPROVED" : "REJECTED",
            notes: action.notes || "",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update request status");
      }

      console.log("✅ Request status updated successfully");
    } catch (error) {
      console.error("Error updating request status:", error);
      throw error;
    }
  }

  // ⭐ เบิกออก (Issue) - เมื่อของถูกส่งมอบแล้ว
  static async issueRequest(requestId: string, notes?: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/admin/requests/${requestId}/issue`,
        {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({
            notes: notes || "",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to issue request");
      }

      console.log("✅ Request issued successfully");
    } catch (error) {
      console.error("Error issuing request:", error);
      throw error;
    }
  }
}
