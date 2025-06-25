import { z } from "zod";

export const inventoryFormSchema = z.object({
  // Basic Information
  name: z
    .string()
    .min(2, "ชื่อครุภัณฑ์ต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อครุภัณฑ์ไม่เกิน 100 ตัวอักษร"),

  code: z
    .string()
    .min(3, "รหัสครุภัณฑ์ต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(20, "รหัสครุภัณฑ์ไม่เกิน 20 ตัวอักษร")
    .regex(
      /^[A-Z0-9-]+$/,
      "รหัสครุภัณฑ์ใช้ได้เฉพาะตัวพิมพ์ใหญ่ ตัวเลข และเครื่องหมาย -"
    ),

  category: z.string().min(1, "กรุณาเลือกหมวดหมู่"),

  subCategory: z.string().optional(),

  description: z.string().max(500, "คำอธิบายไม่เกิน 500 ตัวอักษร").optional(),

  // Product Details
  brand: z.string().max(50, "ยี่ห้อไม่เกิน 50 ตัวอักษร").optional(),

  model: z.string().max(50, "รุ่นไม่เกิน 50 ตัวอักษร").optional(),

  serialNumber: z
    .string()
    .max(50, "หมายเลขเครื่องไม่เกิน 50 ตัวอักษร")
    .optional(),

  // Purchase Information
  purchaseDate: z.string().optional(),

  purchasePrice: z
    .number()
    .min(0, "ราคาต้องไม่น้อยกว่า 0")
    .max(10000000, "ราคาไม่เกิน 10,000,000 บาท")
    .optional(),

  supplier: z.string().max(100, "ผู้จำหน่ายไม่เกิน 100 ตัวอักษร").optional(),

  // Warranty
  warrantyStartDate: z.string().optional(),
  warrantyEndDate: z.string().optional(),
  warrantyTerms: z
    .string()
    .max(200, "เงื่อนไขการรับประกันไม่เกิน 200 ตัวอักษร")
    .optional(),

  // Location
  building: z.string().min(1, "กรุณาเลือกอาคาร"),
  room: z.string().min(1, "กรุณาระบุห้อง"),
  department: z.string().min(1, "กรุณาเลือกหน่วยงาน"),

  // Status
  condition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"], {
    required_error: "กรุณาเลือกสภาพครุภัณฑ์",
  }),

  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "RETIRED"], {
    required_error: "กรุณาเลือกสถานะ",
  }),

  // Additional
  tags: z.array(z.string()).optional(),
  notes: z.string().max(1000, "หมายเหตุไม่เกิน 1000 ตัวอักษร").optional(),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;
