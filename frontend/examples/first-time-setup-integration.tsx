"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FirstTimeSetupWrapper } from "@/components/guards/first-time-setup-guard";

/**
 * Example: วิธีใช้ First-time Setup ใน Layout หลัก
 *
 * ใช้ครอบ content ใน layout เพื่อให้ตรวจสอบ first-time setup อัตโนมัติ
 */
export function ExampleLayoutWithSetup({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirstTimeSetupWrapper>{children}</FirstTimeSetupWrapper>;
}

/**
 * Example: วิธีใช้ Manual Check ใน specific page
 */
export function ExampleManualSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // ตัวอย่างการ redirect ไป first-time setup manually
    const checkAndRedirect = async () => {
      if (status === "loading") return;

      if (!session) {
        router.push("/sign-in");
        return;
      }

      // ตรวจสอบว่าต้องการ setup หรือไม่
      const hasSeenSetup = localStorage.getItem("hasSeenFirstTimeSetup");

      if (!hasSeenSetup) {
        try {
          const { userService } = await import(
            "@/features/mobile/services/user-service"
          );
          const userProfile = await userService.getCurrentUser();

          // ถ้าไม่มีชื่อ หรือข้อมูลไม่ครบ
          if (!userProfile.name?.trim()) {
            router.push("/mobile/setup");
            return;
          }
        } catch (error) {
          console.error("Failed to check profile:", error);
        }
      }
    };

    checkAndRedirect();
  }, [session, status, router]);

  return <div>{/* Page content */}</div>;
}

/**
 * Example: Business Flow Documentation
 *
 * 1. User Login Flow:
 *    - User login ผ่าน Google OAuth
 *    - Check localStorage สำหรับ "hasSeenFirstTimeSetup"
 *    - ถ้าไม่เคยเห็น และ profile ไม่ครบ → แสดง First-time Setup
 *    - ถ้าเคยเห็นแล้ว หรือ profile ครบ → ไปหน้า dashboard ปกติ
 *
 * 2. First-time Setup Flow:
 *    - Step 1: กรอกชื่อ, เบอร์โทร
 *    - Step 2: เลือกคณะ
 *    - Step 3: เลือกภาควิชา/หน่วยงาน (optional)
 *    - Confirmation → บันทึกข้อมูล → เสร็จสิ้น
 *
 * 3. การจัดการ State:
 *    - ใช้ localStorage เก็บว่าเคยเห็น setup แล้วหรือไม่
 *    - ใช้ API เช็คข้อมูล profile ว่าครบหรือไม่
 *    - ใช้ useProfileCompletion hook ตรวจสอบ
 *
 * 4. การ Integration:
 *    Option A: ใช้ FirstTimeSetupWrapper ครอบ layout
 *    Option B: Manual check ใน page component
 *    Option C: ใช้ middleware ใน Next.js (advanced)
 */
