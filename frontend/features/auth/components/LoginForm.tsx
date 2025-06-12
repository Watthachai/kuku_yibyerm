"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FormFieldWrapper,
  PasswordInput,
  LoadingButton,
} from "@/components/enhanced-form";
import { loginSchema, type LoginFormData } from "../types/forms";
import { AuthCard } from "./AuthCard";
import { OAuthProviders } from "./OAuthProviders";
import { useFormState } from "@/features/hooks/useFormState";
import { FormProgress } from "@/components/form/FormProgress";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  // ใช้ custom hook สำหรับ form state
  const formState = useFormState({ form, isLoading });

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0 ku-gradient opacity-10" />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <AuthCard
        title="เข้าสู่ระบบ"
        description="กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ YibYerm"
        footer={
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              ยังไม่มีบัญชี?{" "}
              <a
                href="/auth/register"
                className="ku-text-primary hover:underline font-medium"
              >
                สมัครสมาชิก
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              สำหรับบุคลากรมหาวิทยาลัยเกษตรศาสตร์เท่านั้น
            </p>
          </div>
        }
      >
        <OAuthProviders disabled={isLoading} />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t ku-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">หรือ</span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormFieldWrapper
                name="email"
                label="อีเมล"
                description="ใช้อีเมลของมหาวิทยาลัยเกษตรศาสตร์"
                required
                form={form}
              >
                {(field) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder="example@ku.ac.th"
                    disabled={isLoading}
                    className="ku-border"
                    autoComplete="email"
                  />
                )}
              </FormFieldWrapper>

              <FormFieldWrapper
                name="password"
                label="รหัสผ่าน"
                required
                form={form}
              >
                {(field) => (
                  <PasswordInput
                    field={field}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                )}
              </FormFieldWrapper>

              {/* Additional Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm text-muted-foreground"
                  >
                    จดจำการเข้าสู่ระบบ
                  </label>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto ku-text-primary"
                  type="button"
                >
                  ลืมรหัสผ่าน?
                </Button>
              </div>
            </div>

            {/* Form Progress */}
            {formState.isDirty && (
              <FormProgress
                percentage={formState.getCompletionPercentage()}
                status={
                  formState.getStatusMessage() as {
                    type: "loading" | "error" | "success" | "warning" | "info";
                    message: string;
                  }
                }
                errorCount={formState.errorCount}
              />
            )}

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              className="w-full"
              loading={formState.isLoading}
              disabled={!formState.isReady}
              loadingText="กำลังตรวจสอบข้อมูล..."
            >
              ลงชื่อเข้าใช้
            </LoadingButton>

            {/* Development/Demo Buttons */}
            {process.env.NODE_ENV === "development" && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center">
                  สำหรับการทดสอบ
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.setValue("email", "admin@ku.ac.th");
                      form.setValue("password", "Admin123456");
                    }}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    ข้อมูล Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.setValue("email", "user@ku.ac.th");
                      form.setValue("password", "User123456");
                    }}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    ข้อมูล User
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </AuthCard>
    </div>
  );
}
