// features/admin/services/inventory-service.ts
import { getSession } from "next-auth/react";
import { Item } from "@/lib/utils";

// (ในอนาคต สามารถย้าย getAuthHeaders ไปเป็น helper กลางได้)
async function getAuthHeaders() {
  const session = await getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.accessToken}`,
  };
}

export class InventoryService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  static async getInventory(query: {
    search?: string;
    category?: string;
    department?: string;
  }): Promise<Item[]> {
    const headers = await getAuthHeaders();
    // สร้าง URLSearchParams เพื่อจัดการ query string
    const params = new URLSearchParams();
    if (query.search) params.append("search", query.search);
    if (query.category) params.append("category_id", query.category);
    // เพิ่ม filter อื่นๆ ตามต้องการ

    // ⭐ เราจะเรียกไปที่ /api/v1/assets เพราะ "Inventory" ใน Frontend คือ "Asset" ใน Backend
    const response = await fetch(
      `${this.baseUrl}/api/v1/assets?${params.toString()}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch inventory");
    }
    const responseData = await response.json();
    return responseData.data?.assets || []; // สมมติว่า Backend คืนค่ามาในรูปแบบนี้
  }

  // สามารถเพิ่มฟังก์ชัน create, update, delete ได้ที่นี่
}
