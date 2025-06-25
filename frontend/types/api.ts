// ⭐ Base API Response Structure
export interface BaseApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ⭐ Pagination Structure
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ⭐ Paginated Response Structure
export interface PaginatedResponse<T> {
  products: T[];
  pagination: PaginationMeta;
}

// ⭐ Category Response (from backend)
export interface CategoryResponseData {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ⭐ Product Response (from backend)
export interface ProductResponseData {
  id: number;
  code: string;
  name: string;
  description?: string;
  brand?: string;
  product_model?: string;
  stock: number;
  min_stock: number;
  unit: string;
  status: "ACTIVE" | "INACTIVE";
  category?: CategoryResponseData;
  created_at: string;
  updated_at: string;
}

// ⭐ User Response (from backend)
export interface UserResponseData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

// ⭐ Login Response
export interface LoginResponse {
  user: UserResponseData;
  token: string;
  expires_at: string;
}

// ⭐ Products API Responses
export type ProductsApiResponse = BaseApiResponse<
  PaginatedResponse<ProductResponseData>
>;
export type ProductApiResponse = BaseApiResponse<ProductResponseData>;
export type ProductStatsApiResponse = BaseApiResponse<{
  total: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  categories: number;
}>;

// ⭐ Categories API Responses
export type CategoriesApiResponse = BaseApiResponse<CategoryResponseData[]>;
export type CategoryApiResponse = BaseApiResponse<CategoryResponseData>;

// ⭐ Auth API Responses
export type LoginApiResponse = BaseApiResponse<LoginResponse>;
export type UserApiResponse = BaseApiResponse<UserResponseData>;
