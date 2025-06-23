import { getAuthHeaders } from "@/lib/api";

export interface Category {
  id: number; // ใช้ ID ตัวใหญ่ให้ตรงกับ JSON ที่ Go ส่งมา
  name: string; // ใช้ Name ตัวใหญ่ให้ตรงกับ JSON ที่ Go ส่งมา
}

export class CategoryService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  static async getAllCategories(): Promise<Category[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/categories`, {
        headers,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const responseData = await response.json();
      return responseData.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }
}
