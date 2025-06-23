import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อสินค้า"),
  description: z.string().optional(),
  category_id: z.number().min(1, "กรุณาเลือกหมวดหมู่"),
  brand: z.string().optional(),
  product_model: z.string().optional(),

  // ⭐ เปลี่ยนจาก quantity เป็น stock
  stock: z.number().min(0, "จำนวนต้องมากกว่าหรือเท่ากับ 0"),
  min_stock: z
    .number()
    .min(0, "จำนวนขั้นต่ำต้องมากกว่าหรือเท่ากับ 0")
    .optional(),
  unit: z.string().min(1, "กรุณาระบุหน่วยนับ").optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string(),
});

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
