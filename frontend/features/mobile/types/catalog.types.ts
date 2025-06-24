import { Product } from "./product.types";

// ⭐ Extended Product type สำหรับ Catalog/Shopping view
export interface CatalogProduct {
  id: string;
  code: string;
  name: string;
  description?: string;
  brand?: string;
  productModel?: string;
  serialNumber?: string; // รหัสครุภัณฑ์

  // Stock และ availability
  stock: number;
  minStock: number;
  unit: string;
  status:
    | "AVAILABLE"
    | "BORROWED"
    | "MAINTENANCE"
    | "DAMAGED"
    | "ACTIVE"
    | "INACTIVE";

  // Image
  imageUrl?: string;

  // Categories และ departments
  category: {
    id: string;
    name: string;
  };

  department?: {
    id: string;
    name: string;
    building?: string;
    room?: string;
  };

  // Usage analytics
  usageCount?: number;
  rating?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ⭐ Helper function เพื่อแปลง Product เป็น CatalogProduct
export function convertProductToCatalogProduct(
  product: Product
): CatalogProduct {
  const productData = product as Product & {
    serialNumber?: string;
    department?: {
      id: string;
      name: string;
      building?: string;
      room?: string;
    };
    usageCount?: number;
    rating?: number;
  };

  return {
    id: productData.id,
    code: productData.code,
    name: productData.name,
    description: productData.description,
    brand: productData.brand,
    productModel: productData.productModel,
    serialNumber: productData.serialNumber || productData.code,

    stock: productData.stock,
    minStock: productData.minStock,
    unit: productData.unit,
    status: productData.status === "ACTIVE" ? "AVAILABLE" : "AVAILABLE",

    imageUrl: productData.imageUrl,

    category: {
      id: productData.category?.id || "0",
      name: productData.category?.name || "ไม่ระบุหมวดหมู่",
    },

    department: productData.department,

    usageCount: productData.usageCount || 0,
    rating: productData.rating,

    createdAt: productData.createdAt,
    updatedAt: productData.updatedAt,
  };
}

// ⭐ Helper function เพื่อแปลง CatalogProduct เป็น Product สำหรับ cart store
export function convertCatalogProductToProduct(
  catalogProduct: CatalogProduct
): Product {
  return {
    id: catalogProduct.id,
    code: catalogProduct.code,
    name: catalogProduct.name,
    description: catalogProduct.description,
    brand: catalogProduct.brand,
    productModel: catalogProduct.productModel,
    stock: catalogProduct.stock,
    minStock: catalogProduct.minStock,
    unit: catalogProduct.unit,
    status:
      catalogProduct.status === "AVAILABLE" ? "ACTIVE" : catalogProduct.status,
    imageUrl: catalogProduct.imageUrl,
    category: catalogProduct.category,
    createdAt: catalogProduct.createdAt,
    updatedAt: catalogProduct.updatedAt,
  };
}
