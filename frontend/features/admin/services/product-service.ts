import { getAuthHeaders } from "@/lib/api";
import { Product } from "@/types/product";
import { CreateProductFormData } from "@/features/admin/schemas/product-schema";

interface ProductApiResponse {
  id: number | string;
  code?: string;
  name: string;
  description?: string;
  brand?: string;
  product_model?: string;
  stock?: number;
  min_stock?: number;
  unit?: string;
  status?: string;
  category?: {
    id: number | string;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export class ProductService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  static async getProducts(query: { search?: string }): Promise<Product[]> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (query.search) params.append("search", query.search);

    const response = await fetch(
      `${this.baseUrl}/api/v1/products?${params.toString()}`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const responseData = await response.json();
    return responseData.data?.products || [];
  }

  // ⭐ แก้ไข mapping ให้ใช้ stock แทน quantity
  private static mapProductResponse(data: ProductApiResponse): Product {
    return {
      id: data.id?.toString() || "0",
      code: data.code || "",
      name: data.name || "",
      description: data.description || "",
      brand: data.brand || "",
      productModel: data.product_model || "",

      // ⭐ เปลี่ยนจาก quantity เป็น stock
      stock: data.stock || 0, // จำนวนคงเหลือ
      minStock: data.min_stock || 0, // จำนวนขั้นต่ำ
      unit: data.unit || "ชิ้น", // หน่วยนับ
      status: data.status || "ACTIVE",

      category: data.category
        ? {
            id: data.category.id?.toString() || "0",
            name: data.category.name || "",
          }
        : undefined,

      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  }

  // ⭐ อัปเดต CreateProduct request
  static async createProduct(
    productData: CreateProductFormData
  ): Promise<Product> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/products`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          category_id: productData.categoryId,
          brand: productData.brand,
          product_model: productData.productModel,
          stock: productData.stock,
          min_stock: productData.minStock,
          unit: productData.unit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const result = await response.json();
      return this.mapProductResponse(result.data);
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  // ⭐ อัปเดต UpdateProduct request
  static async updateProduct(
    id: string,
    productData: Partial<CreateProductFormData>
  ): Promise<Product> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/products/${id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          category_id: productData.categoryId,
          brand: productData.brand,
          product_model: productData.productModel,

          // ⭐ ส่ง stock แทน quantity
          stock: productData.stock,
          min_stock: productData.minStock,
          unit: productData.unit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      const result = await response.json();
      return this.mapProductResponse(result.data);
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }
}
