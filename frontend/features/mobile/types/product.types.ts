export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  brand?: string;
  productModel?: string;

  // ⭐ ใช้แค่ stock
  stock: number; // จำนวนคงเหลือ
  minStock: number; // จำนวนขั้นต่ำ
  unit: string; // หน่วยนับ
  status: "ACTIVE" | "INACTIVE"; // ⭐ แก้ไขให้เป็น union type

  // ⭐ เพิ่ม imageUrl field
  imageUrl?: string;

  category?: {
    id: string;
    name: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  categoryId: number;
  brand?: string;
  productModel?: string;
  stock: number; // ⭐ ใช้ stock แทน quantity
  minStock?: number;
  unit?: string;
}
