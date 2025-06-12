"use client";

import AuthForm from "@/features/auth/components/AuthForm";
import { type Signin } from "@/features/auth/types";
import { useUiStore } from "@/features/ui/store";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();
  const setToast = useUiStore((state) => state.setToast);

  const submit = async (credentials: Signin) => {
    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setToast({
          type: "Error",
          message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        });
        return;
      }

      setToast({
        type: "Success",
        message: "ยินดีต้อนรับเข้าสู่ระบบ!",
      });

      router.replace("/dashboard");
    } catch (error) {
      setToast({
        type: "Error",
        message:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      });
    }
  };

  return <AuthForm kind="login" onSubmit={submit} />;
}
