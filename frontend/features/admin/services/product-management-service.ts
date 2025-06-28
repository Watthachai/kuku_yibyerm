import { getSession } from "next-auth/react";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  ProductsResponse,
  ProductStats,
  StockUpdateRequest,
} from "@/types/product";
import {
  ProductsApiResponse,
  ProductApiResponse,
  ProductResponseData,
  ProductStatsApiResponse,
  BaseApiResponse,
} from "@/types/api";

export class ProductManagementService {
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

  // ⭐ Get Products with Advanced Filtering
  static async getProducts(
    filters: ProductFilters = {}
  ): Promise<ProductsResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const url = `${this.baseUrl}/api/v1/products?${params.toString()}`;
      console.log("🔍 Fetching products from:", url);

      const response = await fetch(url, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch products`);
      }

      const data: ProductsApiResponse = await response.json();
      console.log("📦 Raw API response:", data);

      // ⭐ แก้ไข: ใช้ proper typing
      let products: Product[] = [];

      if (data.success && data.data) {
        if (data.data.products && Array.isArray(data.data.products)) {
          // Structure: { success, data: { products: [], pagination: {} } }
          products = data.data.products.map((item: ProductResponseData) =>
            this.mapProductResponse(item)
          );
        } else if (Array.isArray(data.data)) {
          // Structure: { success, data: [] } - fallback
          products = (data.data as ProductResponseData[]).map(
            (item: ProductResponseData) => this.mapProductResponse(item)
          );
        }
      }

      console.log("✅ Mapped products:", products);

      // ⭐ Pagination info
      const pagination = data.data?.pagination;

      return {
        products,
        total: pagination?.total || products.length,
        page: pagination?.current_page || 1,
        totalPages: pagination?.total_pages || 1,
      };
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      throw error;
    }
  }

  // ⭐ Get Product Statistics
  static async getProductStats(): Promise<ProductStats> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/products/stats`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        // Fallback: Calculate from products list
        const { products } = await this.getProducts();
        return this.calculateStatsFromProducts(products);
      }

      const data: ProductStatsApiResponse = await response.json();

      if (data.success && data.data) {
        return {
          total: data.data.total,
          inStock: data.data.in_stock,
          lowStock: data.data.low_stock,
          outOfStock: data.data.out_of_stock,
          categories: data.data.categories,
        };
      }

      throw new Error("Invalid stats response");
    } catch (error) {
      console.error("Error fetching product stats:", error);
      // Fallback calculation
      const { products } = await this.getProducts();
      return this.calculateStatsFromProducts(products);
    }
  }

  // ⭐ Create Product
  static async createProduct(
    productData: CreateProductRequest
  ): Promise<Product> {
    try {
      const headers = await this.getAuthHeaders();
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

          // ⭐ เพิ่ม image_url
          image_url: productData.imageUrl,
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

  // ⭐ Update Product
  static async updateProduct(
    id: string,
    productData: UpdateProductRequest
  ): Promise<Product> {
    try {
      const headers = await this.getAuthHeaders();
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
          stock: productData.stock,
          min_stock: productData.minStock,
          unit: productData.unit,
        }),
      });

      if (!response.ok) {
        const errorData: BaseApiResponse = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      const result: ProductApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Invalid update response");
      }

      return this.mapProductResponse(result.data);
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  // ⭐ Delete Product
  static async deleteProduct(id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/products/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData: BaseApiResponse = await response.json();
        throw new Error(errorData.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  // ⭐ Get Product Details
  static async getProduct(id: string): Promise<Product> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/products/${id}`, {
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch product`);
      }

      const result: ProductApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Invalid product response");
      }

      return this.mapProductResponse(result.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  // ⭐ Bulk Update Stock
  static async bulkUpdateStock(updates: StockUpdateRequest[]): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/products/bulk-stock-update`,
        {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({ updates }),
        }
      );

      if (!response.ok) {
        const errorData: BaseApiResponse = await response.json();
        throw new Error(errorData.message || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  }

  // ⭐ Export Products
  static async exportProducts(format: "csv" | "xlsx" = "csv"): Promise<Blob> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/products/export?format=${format}`,
        { headers, credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to export products");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error exporting products:", error);
      throw error;
    }
  }

  // ⭐ Helper Methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapProductResponse(data: any): Product {
    return {
      id: data.id?.toString() || "0",
      code: data.code || "",
      name: data.name || "",
      description: data.description || "",
      brand: data.brand || "",
      productModel: data.product_model || "",
      stock: data.stock || 0,
      minStock: data.min_stock || 0,
      unit: data.unit || "ชิ้น",
      status: data.status || "ACTIVE",

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
  }

  private static calculateStatsFromProducts(products: Product[]): ProductStats {
    const stats = products.reduce(
      (acc, product) => {
        acc.total++;
        if (product.stock === 0) {
          acc.outOfStock++;
        } else if (product.stock <= product.minStock) {
          acc.lowStock++;
        } else {
          acc.inStock++;
        }
        return acc;
      },
      { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, categories: 0 }
    );

    // Count unique categories
    const uniqueCategories = new Set(
      products.filter((p) => p.category).map((p) => p.category!.id)
    );
    stats.categories = uniqueCategories.size;

    return stats;
  }
}
