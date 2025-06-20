import { getAuthHeaders } from "@/lib/api";
import { Item } from "@/types/inventory";

// สร้าง Interface สำหรับ Query Params เพื่อความชัดเจน
interface InventoryQuery {
  search?: string;
  departmentId?: string;
  categoryId?: string;
}

export class InventoryService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  static async getInventory(query: InventoryQuery): Promise<Item[]> {
    const headers = await getAuthHeaders();

    // สร้าง URLSearchParams เพื่อจัดการ query string อย่างปลอดภัย
    const params = new URLSearchParams();
    if (query.search) params.append("search", query.search);
    if (query.departmentId) params.append("department_id", query.departmentId);
    if (query.categoryId) params.append("category_id", query.categoryId);

    // เราจะเรียกไปที่ /api/v1/assets เพราะ "Inventory" ใน Frontend คือ "Asset" ใน Backend
    const response = await fetch(
      `${this.baseUrl}/api/v1/assets?${params.toString()}`,
      {
        headers,
        cache: "no-store", // เพื่อให้ข้อมูลอัปเดตเสมอ
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch inventory");
    }
    const responseData = await response.json();

    // Backend ของเราคืนค่ามาในรูปแบบ { data: { assets: [...] } }
    return responseData.data?.assets || [];
  }

  // สามารถเพิ่มฟังก์ชัน create, update, delete ได้ที่นี่ในอนาคต
}
