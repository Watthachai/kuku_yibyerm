import * as z from "zod";

export const addAssetSchema = z.object({
  // ขั้นตอนที่ 1: เลือก Product
  productId: z.number({ required_error: "กรุณาเลือกประเภทครุภัณฑ์" }),

  // ขั้นตอนที่ 2: กรอกข้อมูล Asset
  assetCode: z.string().min(1, "กรุณากรอกรหัสครุภัณฑ์"),
  serialNumber: z.string().optional(),
  status: z.string({ required_error: "กรุณาเลือกสถานะ" }),
  locationBuilding: z.string({ required_error: "กรุณาเลือกอาคาร" }),
  locationRoom: z.string().min(1, "กรุณากรอกหมายเลขห้อง"),
  purchaseDate: z.date().optional(),
  purchasePrice: z.coerce.number().optional(),
  notes: z.string().optional(),
  // Field สำหรับรูปภาพ เราจะจัดการแยกต่างหาก
  image: z.any().optional(),
});
