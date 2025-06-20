import * as z from "zod";

// Schema สำหรับฟอร์มย่อย 'สร้างประเภทครุภัณฑ์ใหม่'
export const createProductSchema = z.object({
  name: z.string().min(3, "กรุณากรอกชื่ออย่างน้อย 3 ตัวอักษร"),
  brand: z.string().optional(),
  productModel: z.string().optional(),
  categoryId: z.coerce.number({ required_error: "กรุณาเลือกหมวดหมู่" }),
  trackingMethod: z.enum(["BY_ITEM", "BY_QUANTITY"], {
    required_error: "กรุณาเลือกวิธีการติดตาม",
  }),
  description: z.string().optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
