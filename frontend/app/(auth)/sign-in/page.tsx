"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader2,
  BookOpen,
  Chrome,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //TODO // make if user has a session, redirect to dashboard
  // Initialize form with zod validation
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      // Get session to ensure it's properly set
      await getSession();
      router.push(callbackUrl);
    } catch (error) {
      console.error("Login error:", error);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ku-green via-green-600 to-ku-green-dark">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-ku-green rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                KU Asset
              </CardTitle>
              <p className="text-gray-600 mt-2">
                ระบบจัดการครุภัณฑ์
                <br />
                มหาวิทยาลัยเกษตรศาสตร์
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Google Sign-in */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || isLoading}
                className={cn(
                  "w-full h-11 border-2 transition-all duration-200",
                  "hover:bg-red-50 hover:border-red-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                  googleLoading && "bg-red-50 border-red-300"
                )}
              >
                {googleLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-red-600" />
                ) : (
                  <Chrome className="mr-2 h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {googleLoading
                    ? "กำลังเข้าสู่ระบบ..."
                    : "เข้าสู่ระบบด้วย Google"}
                </span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 font-medium">
                    หรือ
                  </span>
                </div>
              </div>
            </div>

            {/* Credentials Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อีเมล</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ใส่อีเมล @ku.ac.th หรือ @ku.th"
                          {...field}
                          disabled={isLoading || googleLoading}
                          className="h-11 focus:ring-2 focus:ring-ku-green focus:border-ku-green"
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
                      <FormLabel>รหัสผ่าน</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="ใส่รหัสผ่าน"
                            {...field}
                            disabled={isLoading || googleLoading}
                            className="h-11 pr-10 focus:ring-2 focus:ring-ku-green focus:border-ku-green"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading || googleLoading}
                            tabIndex={-1}
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
                  disabled={isLoading || googleLoading}
                  className={cn(
                    "w-full h-11 bg-ku-green hover:bg-ku-green-dark transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>
              </form>
            </Form>

            {/* Footer */}
            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                <p>สำหรับบุคลากรและนิสิต</p>
                <p>มหาวิทยาลัยเกษตรศาสตร์เท่านั้น</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  หากมีปัญหาในการเข้าสู่ระบบ กรุณาติดต่อ{" "}
                  <a
                    href="mailto:support@ku.ac.th"
                    className="text-ku-green hover:text-ku-green-dark font-medium"
                  >
                    support@ku.ac.th
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
