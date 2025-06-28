import { getSession } from "next-auth/react";

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryApiResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

export class CategoryService {
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

  // ⭐ Get all categories
  static async getCategories(): Promise<Array<{ id: string; name: string }>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/categories`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch categories`);
      }

      const data: CategoryApiResponse = await response.json();
      console.log("📂 Categories API response:", data);

      if (!data.success || !Array.isArray(data.data)) {
        console.warn("Unexpected categories response structure:", data);
        return [];
      }

      // แปลงให้ตรงกับ interface ที่ EditProductDialog ต้องการ
      return data.data.map((category) => ({
        id: category.id.toString(),
        name: category.name,
      }));
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      throw error;
    }
  }

  // ⭐ Get category by ID
  static async getCategory(id: string): Promise<Category> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/categories/${id}`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch category`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error("Invalid category response");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  }

  // ⭐ Create category (สำหรับ Admin)
  static async createCategory(categoryData: {
    name: string;
    description?: string;
  }): Promise<Category> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/categories`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Invalid create response");
      }

      return result.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  // ⭐ Update category
  static async updateCategory(
    id: string,
    categoryData: { name: string; description?: string }
  ): Promise<Category> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/categories/${id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category");
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Invalid update response");
      }

      return result.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  // ⭐ Delete category
  static async deleteCategory(id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/categories/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  // ⭐ Get categories for mobile/general use
  static async getAllCategories(): Promise<Category[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/categories`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch categories`);
      }

      const data: CategoryApiResponse = await response.json();

      if (!data.success || !Array.isArray(data.data)) {
        console.warn("Unexpected categories response structure:", data);
        return [];
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching all categories:", error);
      throw error;
    }
  }
}
