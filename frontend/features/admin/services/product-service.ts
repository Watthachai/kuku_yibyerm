import { getAuthHeaders } from "@/lib/api";
import { CONFIG } from "@/lib/config";
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
  image_url?: string; // ⭐ เพิ่ม image_url field
  category?: {
    id: number | string;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export class ProductService {
  private static baseUrl = CONFIG.BACKEND_URL;

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
    const rawProducts = responseData.data?.products || [];

    // ⭐ แปลงข้อมูลผ่าน mapProductResponse
    return rawProducts.map((product: ProductApiResponse) =>
      this.mapProductResponse(product)
    );
  }

  // ⭐ แก้ไข mapping ให้ใช้ stock แทน quantity
  private static mapProductResponse(data: ProductApiResponse): Product {
    console.log("Mapping product data:", data); // ⭐ Debug log

    const product = {
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
      status: (data.status === "ACTIVE" || data.status === "INACTIVE"
        ? data.status
        : "ACTIVE") as "ACTIVE" | "INACTIVE",

      // ⭐ เพิ่ม imageUrl mapping
      imageUrl: data.image_url || undefined,

      category: data.category
        ? {
            id: data.category.id?.toString() || "0",
            name: data.category.name || "",
          }
        : undefined,

      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };

    console.log("Mapped product:", product); // ⭐ Debug log
    return product;
  }

  // ⭐ อัปเดต CreateProduct request
  static async createProduct(
    productData: CreateProductFormData & { image_url?: string }
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
          category_id: productData.category_id,
          brand: productData.brand,
          product_model: productData.product_model,
          stock: productData.stock,
          min_stock: productData.min_stock,
          unit: productData.unit,
          image_url: productData.image_url || undefined,
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
    productData: Partial<CreateProductFormData & { image_url?: string }>
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
          category_id: productData.category_id,
          brand: productData.brand,
          product_model: productData.product_model,

          // ⭐ ส่ง stock แทน quantity
          stock: productData.stock,
          min_stock: productData.min_stock,
          unit: productData.unit,
          image_url: productData.image_url,
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
