"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const errorMessages = {
  Configuration: "เกิดข้อผิดพลาดในการตั้งค่าระบบ",
  AccessDenied:
    "คุณไม่มีสิทธิ์เข้าใช้งานระบบ กรุณาใช้อีเมลของมหาวิทยาลัยเกษตรศาสตร์",
  Verification: "เกิดข้อผิดพลาดในการยืนยันตัวตน",
  Default: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
} as const;

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") as keyof typeof errorMessages;
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ku-green via-green-600 to-ku-green-dark">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              เข้าสู่ระบบไม่สำเร็จ
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">{message}</p>
              {error === "AccessDenied" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>หมายเหตุ:</strong> ระบบรองรับเฉพาะอีเมล @ku.ac.th
                    และ @ku.th เท่านั้น
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-ku-green hover:bg-ku-green-dark"
              >
                <Link href="/sign-in">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/">กลับหน้าหลัก</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
