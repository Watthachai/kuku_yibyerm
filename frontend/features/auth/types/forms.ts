import { z } from "zod";

// 🎯 Login Form Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .refine(
      (email) => email.endsWith("@ku.ac.th") || email.endsWith("@gmail.com"),
      "กรุณาใช้อีเมลของมหาวิทยาลัยเกษตรศาสตร์หรือ Gmail"
    ),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "รหัสผ่านต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข"
    ),
});

// 🎯 Register Form Schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
      .max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร")
      .regex(/^[ก-๙a-zA-Z\s]+$/, "ชื่อสามารถใช้ได้เฉพาะตัวอักษรไทยและอังกฤษ"),
    email: z
      .string()
      .min(1, "กรุณากรอกอีเมล")
      .email("รูปแบบอีเมลไม่ถูกต้อง")
      .refine(
        (email) => email.endsWith("@ku.ac.th"),
        "กรุณาใช้อีเมลของมหาวิทยาลัยเกษตรศาสตร์"
      ),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "รหัสผ่านต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข"
      ),
    confirmPassword: z.string(),
    department: z.string().min(1, "กรุณาเลือกหน่วยงาน").optional(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "กรุณายอมรับเงื่อนไขการใช้งาน"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

// 🎯 Profile Form Schema
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .refine(
      (email) => email.endsWith("@ku.ac.th"),
      "กรุณาใช้อีเมลของมหาวิทยาลัยเกษตรศาสตร์"
    ),
  department: z.string().min(1, "กรุณาเลือกหน่วยงาน"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "เบอร์โทรต้องเป็นตัวเลข 10 หลัก")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "คำอธิบายต้องไม่เกิน 500 ตัวอักษร").optional(),
});

// 🎯 Change Password Schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
    newPassword: z
      .string()
      .min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "รหัสผ่านต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข"
      ),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "รหัสผ่านใหม่ไม่ตรงกัน",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน",
    path: ["newPassword"],
  });

// 🎯 Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// 🎯 Form State Types
export interface FormState<T = unknown> {
  data: T;
  isLoading: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string[]>;
}

// 🎯 Form Action Types
export type FormAction<T = unknown> =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_DATA"; payload: T }
  | { type: "SET_ERRORS"; payload: Record<string, string[]> }
  | { type: "RESET_FORM" }
  | { type: "SET_FIELD"; payload: { field: keyof T; value: unknown } };

// 🎯 Department Options
export const DEPARTMENTS = [
  { value: "agriculture", label: "คณะเกษตร" },
  { value: "engineering", label: "คณะวิศวกรรมศาสตร์" },
  { value: "science", label: "คณะวิทยาศาสตร์" },
  { value: "forestry", label: "คณะวนศาสตร์" },
  { value: "fisheries", label: "คณะประมง" },
  { value: "economics", label: "คณะเศรษฐศาสตร์" },
  { value: "humanities", label: "คณะมนุษยศาสตร์" },
  { value: "social-sciences", label: "คณะสังคมศาสตร์" },
  { value: "education", label: "คณะศึกษาศาสตร์" },
  { value: "veterinary", label: "คณะสัตวแพทยศาสตร์" },
  { value: "agro-industry", label: "คณะอุตสาหกรรมเกษตร" },
  { value: "environment", label: "คณะสิ่งแวดล้อม" },
  { value: "architecture", label: "คณะสถาปัตยกรรมศาสตร์" },
  { value: "business", label: "คณะบริหารธุรกิจ" },
  { value: "liberal-arts", label: "วิทยาลัยศิลปศาสตร์" },
  { value: "administration", label: "สำนักงานอธิการบดี" },
] as const;

export type DepartmentValue = (typeof DEPARTMENTS)[number]["value"];
