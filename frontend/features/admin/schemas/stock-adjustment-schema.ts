import * as z from "zod";

export const stockAdjustmentSchema = z.object({
  // ไม่ต้องมี assetId เพราะเราจะส่งไปพร้อมกับ form data
  adjustmentType: z.enum(["ADD", "SET", "REMOVE"], {
    required_error: "กรุณาเลือกประเภทการปรับ",
  }),
  quantity: z.coerce.number().min(1, "จำนวนต้องมากกว่า 0"),
  notes: z.string().optional(),
});

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;
