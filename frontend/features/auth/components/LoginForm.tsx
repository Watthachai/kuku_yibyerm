"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthCard } from "./AuthCard";
import { PasswordInput } from "./PasswordInput";
import type { Signin } from "@/features/auth/types";
import { signin } from "@/features/auth/validators";

interface LoginFormProps {
  onSubmit: SubmitHandler<Signin>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<Signin>({
    resolver: zodResolver(signin),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: Signin) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <>
      {/* Additional Links */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ลืมรหัสผ่าน?{" "}
          <a
            href="#"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            รีเซ็ตรหัสผ่าน
          </a>
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          สำหรับบุคลากรมหาวิทยาลัยเกษตรศาสตร์เท่านั้น
        </p>
      </div>
    </>
  );

  return (
    <AuthCard
      title="ลงชื่อเข้าใช้"
      description="กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ"
      footer={footer}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  อีเมล
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="กรอกอีเมลของคุณ"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  รหัสผ่าน
                </FormLabel>
                <PasswordInput
                  placeholder="กรอกรหัสผ่านของคุณ"
                  disabled={isLoading}
                  field={field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังตรวจสอบ...
              </>
            ) : (
              "ลงชื่อเข้าใช้"
            )}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
