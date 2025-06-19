import { z } from "zod";
import { addAssetSchema } from "@/features/admin/schemas/asset-schema"; // เราจะสร้างไฟล์นี้ในขั้นตอนถัดไป

// Type สำหรับข้อมูลที่ได้จาก Backend (Product ที่เป็น Catalog)
export interface Product {
  id: number;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  category: {
    id: string;
    name: string;
  };
}

// Type สำหรับข้อมูลในฟอร์มของเรา (Zod-inferred)
export type AssetFormData = z.infer<typeof addAssetSchema>;

// Type สำหรับข้อมูลที่จะส่งไปสร้าง Asset ที่ Backend
export interface CreateAssetData extends AssetFormData {
  productId: number; // ต้องมี ID ของ Product ที่เลือก
}
