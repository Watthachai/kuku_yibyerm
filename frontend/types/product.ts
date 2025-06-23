import { z } from "zod";
// เราจะ import schema ที่ยังต้องใช้งานอยู่เท่านั้น
import { createProductSchema } from "@/features/admin/schemas/product-schema";
import { stockAdjustmentSchema } from "@/features/admin/schemas/stock-adjustment-schema";

/**
 * Type หลักสำหรับแสดงผล "สินค้า/วัสดุสิ้นเปลือง" ในระบบ
 * ข้อมูลนี้คือสิ่งที่ Backend ส่งกลับมาจาก API /products
 */
export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  brand?: string;
  productModel?: string;

  // ⭐ เปลี่ยนจาก quantity เป็น stock
  stock: number; // จำนวนคงเหลือ (แทน quantity)
  minStock: number; // จำนวนขั้นต่ำ
  unit: string; // หน่วยนับ
  status: string;

  category?: {
    id: string;
    name: string;
  };

  createdAt: string;
  updatedAt: string;
}

/**
 * Type สำหรับข้อมูลในฟอร์ม "เพิ่มสินค้าใหม่"
 */
export type CreateProductFormData = z.infer<typeof createProductSchema>;

/**
 * Type สำหรับข้อมูลในฟอร์ม "ปรับสต็อก"
 */
export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

/**
 * Type สำหรับข้อมูลที่จะส่งไปหา API เพื่อปรับสต็อก
 */
export interface StockAdjustmentData extends StockAdjustmentFormData {
  productId: number;
}

// ❌ เราได้ลบ Type ที่ไม่จำเป็นออกไปแล้ว เช่น Item, AssetFormData, CreateAssetData
