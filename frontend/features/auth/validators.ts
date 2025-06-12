import { z } from "zod";

export const signin = z.object({
  email: z.string().min(1, "กรุณากรอกอีเมล").email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
    .min(1, "กรุณากรอกรหัสผ่าน"),
});

export const signup = z.object({
  name: z
    .string()
    .min(1, "กรุณากรอกชื่อ")
    .min(2, "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร"),
  email: z.string().min(1, "กรุณากรอกอีเมล").email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
    .min(1, "กรุณากรอกรหัสผ่าน"),
});
