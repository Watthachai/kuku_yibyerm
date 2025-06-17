import { apiClient } from './client';

export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  imageUrl?: string;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "DAMAGED";
  availableQuantity: number;
  totalQuantity: number;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  department: {
    id: string;
    name: string;
  };
  rating?: number;
  borrowCount?: number;
  location?: string;
  price?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  status?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export class ProductService {
  static async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams();
    
    if (filters.categoryId) params.append('category_id', filters.categoryId);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.departmentId) params.append('department_id', filters.departmentId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data;
  }

  static async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.product;
  }

  static async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/categories');
    return response.data.categories;
  }
}