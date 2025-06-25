"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserProfile } from "@/features/mobile/services/user-service";

interface ProfileCompletionState {
  isComplete: boolean;
  isLoading: boolean;
  missingFields: string[];
  userProfile: UserProfile | null;
}

/**
 * Hook สำหรับตรวจสอบความสมบูรณ์ของโปรไฟล์ผู้ใช้
 * ใช้สำหรับแสดง First-time Setup เมื่อจำเป็น
 */
export function useProfileCompletion(): ProfileCompletionState {
  const { data: session, status } = useSession();
  const [state, setState] = useState<ProfileCompletionState>({
    isComplete: true, // เริ่มต้นเป็น true เพื่อไม่ให้แสดง setup โดยไม่จำเป็น
    isLoading: true,
    missingFields: [],
    userProfile: null,
  });

  useEffect(() => {
    const checkProfileCompletion = async () => {
      // ถ้ายังไม่ได้ login หรือ session ยังโหลดอยู่
      if (status === "loading" || !session?.user) {
        setState({
          isComplete: true,
          isLoading: status === "loading",
          missingFields: [],
          userProfile: null,
        });
        return;
      }

      // ถ้า login แล้วแต่เป็น first-time login (ยังไม่มีข้อมูลครบ)
      // ใช้การตรวจสอบจาก userProfile แทน
      try {
        // โหลดข้อมูล profile จาก API
        const { userService } = await import(
          "@/features/mobile/services/user-service"
        );
        const userProfile = await userService.getCurrentUser();

        // ตรวจสอบ required fields
        const missingFields: string[] = [];

        if (!userProfile.name?.trim()) {
          missingFields.push("name");
        }

        // อาจเพิ่มเงื่อนไขอื่นๆ ในอนาคต
        // if (!userProfile.department_id) {
        //   missingFields.push("department");
        // }

        const isComplete = missingFields.length === 0;

        setState({
          isComplete,
          isLoading: false,
          missingFields,
          userProfile,
        });
      } catch (error) {
        console.error("Failed to check profile completion:", error);
        // ถ้า error ให้ถือว่า complete เพื่อไม่ให้ block user
        setState({
          isComplete: true,
          isLoading: false,
          missingFields: [],
          userProfile: null,
        });
      }
    };

    checkProfileCompletion();
  }, [session, status]);

  return state;
}

/**
 * Helper function เพื่อตรวจสอบว่าผู้ใช้ควรเห็น First-time Setup หรือไม่
 */
export function shouldShowFirstTimeSetup(
  profileState: ProfileCompletionState,
  hasSeenSetup: boolean = false
): boolean {
  return (
    !profileState.isLoading &&
    !profileState.isComplete &&
    !hasSeenSetup &&
    profileState.userProfile !== null
  );
}
