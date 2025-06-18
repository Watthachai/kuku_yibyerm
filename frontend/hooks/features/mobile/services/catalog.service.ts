import { Product, ProductFilters } from '../types/product.types';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

class CatalogService {
  private baseUrl = '/api/catalog';

  async getProducts(filters?: Partial<ProductFilters>): Promise<Product[]> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.status) params.append('status', filters.status.join(','));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = `${this.baseUrl}/products?${params.toString()}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return await response.json();
    } catch (error) {
      console.error('CatalogService.getProducts error:', error);
      // Return mock data for now
      return this.getMockProducts(filters);
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return await response.json();
    } catch (error) {
      console.error('CatalogService.getProduct error:', error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return await response.json();
    } catch (error) {
      console.error('CatalogService.getCategories error:', error);
      return [];
    }
  }

  async getDepartments(): Promise<Department[]> {
    try {
      const response = await fetch(`${this.baseUrl}/departments`);
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      return await response.json();
    } catch (error) {
      console.error('CatalogService.getDepartments error:', error);
      return [];
    }
  }

  private getMockProducts(filters?: Partial<ProductFilters>): Product[] {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'เครื่องฉายภาพ Epson EB-X41',
        code: 'EP001-2024',
        description: 'เครื่องฉายภาพ 3LCD สำหรับห้องเรียน ความสว่าง 3600 lumens',
        status: 'AVAILABLE',
        availableQuantity: 3,
        totalQuantity: 5,
        category: {
          id: '1',
          name: 'อุปกรณ์โสตทัศนูปกรณ์',
          icon: '📽️',
          color: '#3B82F6'
        },
        department: {
          id: '1',
          name: 'คณะเกษตร',
          code: 'AGR'
        },
        rating: 4.8,
        usageCount: 156,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'เครื่องพิมพ์ HP LaserJet Pro',
        code: 'HP002-2024',
        description: 'เครื่องพิมพ์เลเซอร์ขาวดำ ความเร็วสูง',
        status: 'AVAILABLE',
        availableQuantity: 2,
        totalQuantity: 3,
        category: {
          id: '2',
          name: 'อุปกรณ์สำนักงาน',
          icon: '🖨️',
          color: '#10B981'
        },
        department: {
          id: '2',
          name: 'คณะวิศวกรรมศาสตร์',
          code: 'ENG'
        },
        rating: 4.6,
        usageCount: 134,
        createdAt: new Date().toISOString()
      }
    ];

    // Apply filters
    let filtered = mockProducts;
    
    if (filters?.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    if (filters?.categoryId) {
      filtered = filtered.filter(p => p.category.id === filters.categoryId);
    }

    return filtered;
  }
}

export const catalogService = new CatalogService();
export { CatalogService };