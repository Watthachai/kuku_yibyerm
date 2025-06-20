import { z } from "zod";
import { addAssetSchema } from "@/features/admin/schemas/asset-schema";

// Type สำหรับข้อมูล Product ที่ดึงมาจาก Backend เพื่อใช้ใน ComboBox
export interface Product {
  id: number;
  name: string;
  trackingMethod: "BY_ITEM" | "BY_QUANTITY";
  brand?: string;
  productModel?: string;
}

// types/inventory.ts

// Type นี้ควรจะตรงกับ AssetResponse DTO จาก Backend
export interface Item {
  id: number;
  assetCode: string;
  name: string; // มาจาก Product ที่ผูกกัน
  serialNumber?: string;
  description?: string;
  imageUrl?: string;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "DAMAGED";
  quantity: number;
  category: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
}

// Type สำหรับข้อมูลในฟอร์มของเรา ที่ได้จากการแปลง Zod Schema
export type AssetFormData = z.infer<typeof addAssetSchema>;

// Type สำหรับข้อมูลที่จะส่งไปสร้าง Asset ที่ Backend (อาจจะไม่จำเป็นแล้วถ้า Form Data ตรงกับที่ API ต้องการ)
export interface CreateAssetData extends AssetFormData {
  productId: number; // ID ของ Product ที่เลือก
}
