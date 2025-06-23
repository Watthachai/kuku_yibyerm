"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/requests");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ส่งคำขอสำเร็จ!
        </h1>

        <p className="text-gray-600 mb-6">
          คำขอเบิกครุภัณฑ์ของคุณได้ถูกส่งเรียบร้อยแล้ว
          {requestId && (
            <>
              <br />
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                ID: {requestId}
              </span>
            </>
          )}
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/requests")}
            className="w-full bg-ku-green hover:bg-ku-green-dark"
          >
            ดูคำขอของฉัน
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="w-full"
          >
            กลับหน้าหลัก
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          หน้านี้จะเปลี่ยนไปหน้าคำขอโดยอัตโนมัติใน 5 วินาที
        </p>
      </div>
    </div>
  );
}
