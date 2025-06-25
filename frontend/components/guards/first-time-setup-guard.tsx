"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FirstTimeSetup } from "@/features/mobile/components/profile/first-time-setup";
import {
  useProfileCompletion,
  shouldShowFirstTimeSetup,
} from "@/hooks/use-profile-completion";

interface FirstTimeSetupWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component ที่จัดการ First-time Setup Flow
 * ใช้ครอบ layout หลักเพื่อตรวจสอบและแสดง setup เมื่อจำเป็น
 */
export function FirstTimeSetupWrapper({
  children,
}: FirstTimeSetupWrapperProps) {
  const router = useRouter();
  const profileState = useProfileCompletion();
  const [hasSeenSetup, setHasSeenSetup] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // ตรวจสอบจาก localStorage ว่าเคยเห็น setup แล้วหรือไม่
  useEffect(() => {
    const seen = localStorage.getItem("hasSeenFirstTimeSetup");
    setHasSeenSetup(seen === "true");
  }, []);

  const handleSetupComplete = () => {
    // บันทึกว่าทำ setup เสร็จแล้ว
    localStorage.setItem("hasSeenFirstTimeSetup", "true");
    setHasSeenSetup(true);
    setIsSetupComplete(true);

    // Redirect ไปหน้า dashboard
    router.push("/mobile/dashboard");
  };

  const handleSetupSkip = () => {
    // บันทึกว่าข้ามไปแล้ว
    localStorage.setItem("hasSeenFirstTimeSetup", "true");
    setHasSeenSetup(true);
  };

  // แสดง First-time Setup ถ้าจำเป็น
  if (
    shouldShowFirstTimeSetup(profileState, hasSeenSetup) &&
    !isSetupComplete
  ) {
    return (
      <FirstTimeSetup
        onComplete={handleSetupComplete}
        onSkip={handleSetupSkip}
      />
    );
  }

  // แสดงเนื้อหาปกติ
  return <>{children}</>;
}

/**
 * Hook สำหรับใช้ใน page component เพื่อตรวจสอบสถานะ
 */
export function useFirstTimeSetupState() {
  const profileState = useProfileCompletion();
  const [hasSeenSetup, setHasSeenSetup] = useState(true); // เริ่มต้นเป็น true เพื่อไม่ให้กระพริบ

  useEffect(() => {
    const seen = localStorage.getItem("hasSeenFirstTimeSetup");
    setHasSeenSetup(seen === "true");
  }, []);

  return {
    shouldShowSetup: shouldShowFirstTimeSetup(profileState, hasSeenSetup),
    isLoading: profileState.isLoading,
    userProfile: profileState.userProfile,
    missingFields: profileState.missingFields,
  };
}
