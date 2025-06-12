"use client";

import AuthForm from "@/features/auth/components/AuthForm";
import { useRegister } from "@/features/auth/hooks/api";
import { type Signup } from "@/features/auth/types";
import { useUiStore } from "@/features/ui/store";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useRouter } from "next/navigation";

const Register = () => {
  const router = useRouter();
  const { mutateAsync } = useRegister();
  const setToast = useUiStore((state) => state.setToast);
  const setSession = useAuthStore((state) => state.setSession);

  const submit = async (credentials: Signup) => {
    try {
      const response = await mutateAsync(credentials);

      // Set session in store
      setSession({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expires: "", // You might want to decode JWT to get expiry
      });

      setToast({
        type: "Success",
        message: "สมัครสมาชิกสำเร็จ! ยินดีต้อนรับเข้าสู่ระบบ",
      });

      router.replace("/dashboard");
    } catch (error) {
      setToast({
        type: "Error",
        message:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการสมัครสมาชิก",
      });
    }
  };

  return <AuthForm kind="register" onSubmit={submit} />;
};

export default Register;
