import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "กรุณากรอกอีเมล").email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
    .min(1, "กรุณากรอกรหัสผ่าน"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
