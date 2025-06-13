import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .refine(
      (email) => email.endsWith("@ku.ac.th") || email.endsWith("@ku.th"),
      "กรุณาใช้อีเมลของมหาวิทยาลัยเกษตรศาสตร์ (@ku.ac.th หรือ @ku.th)"
    ),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน")
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "กรุณากรอกชื่อ")
      .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
    email: z
      .string()
      .min(1, "กรุณากรอกอีเมล")
      .email("รูปแบบอีเมลไม่ถูกต้อง")
      .refine(
        (email) => email.endsWith("@ku.ac.th") || email.endsWith("@ku.th"),
        "กรุณาใช้อีเมลของมหาวิทยาลัยเกษตรศาสตร์"
      ),
    password: z
      .string()
      .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "รหัสผ่านต้องประกอบด้วยตัวพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข"
      ),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
