export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  status: ProductStatus;
  availableQuantity: number;
  totalQuantity: number;
  category: Category;
  department: Department;
  specifications?: Record<string, string>;
  tags?: string[];
  rating?: number;
  usageCount?: number;
  location?: string;
  lastMaintenanceDate?: string;
  serialNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  productCount?: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  building?: string;
  floor?: string;
  contact?: string;
}

export type ProductStatus = 
  | 'AVAILABLE' 
  | 'IN_USE' 
  | 'MAINTENANCE' 
  | 'DAMAGED' 
  | 'RESERVED';

export interface ProductFilters {
  search: string;
  categoryId?: string;
  departmentId?: string;
  status?: ProductStatus[];
  sortBy: ProductSortBy;
  sortOrder: 'asc' | 'desc';
}

export type ProductSortBy = 
  | 'name' 
  | 'popularity' 
  | 'availability' 
  | 'newest' 
  | 'rating';