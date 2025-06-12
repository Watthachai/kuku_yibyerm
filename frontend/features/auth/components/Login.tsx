"use client";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { type Signin } from "@/features/auth/types";
import { useRouter } from "next/navigation";
import { signIn, setAuthToken } from "@/lib/auth";
import { toast } from "sonner";

const Login = () => {
  const router = useRouter();

  const submit = async (credentials: Signin) => {
    try {
      const result = await signIn(credentials);

      // เก็บ token
      setAuthToken(result.accessToken);

      // แสดง toast สำเร็จ
      toast.success("เข้าสู่ระบบสำเร็จ!", {
        description: `ยินดีต้อนรับ ${result.user.name || result.user.email}`,
      });

      // redirect ไปหน้า dashboard
      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      toast.error("เข้าสู่ระบบไม่สำเร็จ", {
        description: errorMessage,
      });
    }
  };

  return <LoginForm onSubmit={submit} />;
};

export default Login;
