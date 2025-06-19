import { Product } from "@/types/inventory";
import { getAuthHeaders } from "@/lib/api";

export class ProductService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // ฟังก์ชันสำหรับดึง Product ทั้งหมดมาให้ ComboBox เลือก
  static async getProductsForSelection(): Promise<Product[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/products?limit=1000`,
        {
          // ดึงมาทั้งหมด
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products for selection");
      }
      const responseData = await response.json();
      // สมมติว่า Backend คืนค่ามาในรูปแบบ { data: { products: [...] } }
      return responseData.data?.products || [];
    } catch (error) {
      console.error("Error in getProductsForSelection:", error);
      return []; // คืนค่า array ว่างเมื่อเกิด error
    }
  }
}
