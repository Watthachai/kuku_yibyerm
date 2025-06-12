"use client";

import { useState } from "react";
import type * as types from "@/features/auth/types";
import * as validators from "@/features/auth/validators";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { OAuthProviders } from "./OAuthProviders";
import { AuthCard } from "./AuthCard";

type AuthFormProps =
  | {
      kind: "login";
      onSubmit: SubmitHandler<types.Signin>;
    }
  | {
      kind: "register";
      onSubmit: SubmitHandler<types.Signup>;
    };

const AuthForm = ({ kind, onSubmit }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Create properly typed forms for each case
  const loginForm = useForm<types.Signin>({
    resolver: zodResolver(validators.signin),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<types.Signup>({
    resolver: zodResolver(validators.signup),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: types.Signin | types.Signup) => {
    setIsLoading(true);
    try {
      if (kind === "login") {
        await (onSubmit as SubmitHandler<types.Signin>)(data as types.Signin);
      } else {
        await (onSubmit as SubmitHandler<types.Signup>)(data as types.Signup);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render login form
  if (kind === "login") {
    return (
      <AuthCard
        title="ลงชื่อเข้าใช้"
        description="กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ"
        footer={
          <div className="space-y-4">
            {/* Additional Links */}
            <div className="text-center">
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
            <div className="pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                สำหรับบุคลากรมหาวิทยาลัยเกษตรศาสตร์เท่านั้น
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* OAuth Providers */}
          <OAuthProviders disabled={isLoading} />

          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={loginForm.control}
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
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      รหัสผ่าน
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="กรอกรหัสผ่านของคุณ"
                          className="pr-10"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
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
        </div>
      </AuthCard>
    );
  }

  // Render register form (similar structure)
  return (
    <AuthCard title="สมัครสมาชิก" description="กรุณากรอกข้อมูลเพื่อสมัครสมาชิก">
      <div className="space-y-6">
        {/* OAuth Providers */}
        <OAuthProviders disabled={isLoading} />

        <Form {...registerForm}>
          <form
            onSubmit={registerForm.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={registerForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    ชื่อ-นามสกุล
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="กรอกชื่อและนามสกุลของคุณ"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registerForm.control}
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
              control={registerForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    รหัสผ่าน
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="กรอกรหัสผ่านของคุณ"
                        className="pr-10"
                        {...field}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
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
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                "สมัครสมาชิก"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  );
};

export default AuthForm;
