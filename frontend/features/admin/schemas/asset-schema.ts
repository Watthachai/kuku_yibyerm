import * as z from "zod";

export const addAssetSchema = z
  .object({
    productId: z.coerce.number({ required_error: "กรุณาเลือกประเภทครุภัณฑ์" }),
    trackingMethod: z.enum(["BY_ITEM", "BY_QUANTITY"]),
    assetCode: z.string().optional(),
    serialNumber: z.string().optional(),
    status: z.string().optional(),
    quantity: z.coerce.number().optional(),
    locationBuilding: z.string({ required_error: "กรุณาเลือกอาคาร" }),
    locationRoom: z.string().min(1, "กรุณากรอกหมายเลขห้อง"),
  })
  .superRefine((data, ctx) => {
    if (data.trackingMethod === "BY_ITEM") {
      if (!data.assetCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "กรุณากรอกรหัสครุภัณฑ์",
          path: ["assetCode"],
        });
      }
      if (!data.status) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "กรุณาเลือกสถานะ",
          path: ["status"],
        });
      }
    }
    if (data.trackingMethod === "BY_QUANTITY") {
      if (!data.quantity || data.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "กรุณากรอกจำนวน > 0",
          path: ["quantity"],
        });
      }
    }
  });
