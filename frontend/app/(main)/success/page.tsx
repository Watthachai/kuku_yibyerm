"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, FileCheck, Home } from "lucide-react";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.log("🎉 [SUCCESS] Success page loaded");
    console.log("🆔 [SUCCESS] RequestId from URL:", requestId);
    console.log(
      "🔍 [SUCCESS] SearchParams:",
      Object.fromEntries(searchParams.entries())
    );
    console.log("⏰ [SUCCESS] Starting countdown timer");

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        console.log("⏰ [SUCCESS] Countdown:", prev);
        if (prev <= 1) {
          console.log(
            "🔄 [SUCCESS] Countdown finished, redirecting to requests"
          );
          // ⭐ ใช้ window.location.replace แทน router.push เพื่อป้องกัน React error
          window.location.replace("/requests");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      console.log("🧹 [SUCCESS] Cleaning up countdown interval");
      clearInterval(countdownInterval);
    };
  }, [requestId, searchParams]); // ⭐ ลบ router ออกจาก dependencies

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* ⭐ Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-400 to-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* ⭐ Main content with glass morphism */}
      <div className="relative">
        {/* Success animation container */}
        <div className="bg-white/30 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
          {/* ⭐ Success icon with animation */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-4 inline-block shadow-lg">
              <CheckCircle className="w-12 h-12 text-white animate-bounce" />
            </div>
          </div>

          {/* ⭐ Title with gradient text */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            ส่งคำขอสำเร็จ!
          </h1>

          {/* ⭐ Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            คำขอเบิกครุภัณฑ์ของคุณได้ถูกส่งเรียบร้อยแล้ว
            <br />
            <span className="text-sm text-gray-600">
              ระบบจะดำเนินการตรวจสอบและอนุมัติคำขอของคุณ
            </span>
          </p>

          {/* ⭐ Request ID with glass card */}
          {requestId && (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/30">
              <div className="flex items-center justify-center space-x-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  รหัสคำขอ
                </span>
              </div>
              <div className="text-lg font-mono font-bold text-blue-600 mt-1">
                REQ{new Date().toISOString().slice(0, 10).replace(/-/g, "")}
                {String(requestId).padStart(3, "0")}
              </div>
            </div>
          )}

          {/* ⭐ Action buttons with glass effect */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={() => window.location.replace("/requests")}
              className="w-full bg-gradient-to-r from-ku-green to-emerald-600 hover:from-ku-green-dark hover:to-emerald-700 text-white rounded-xl h-12 font-medium shadow-lg backdrop-blur-sm border-0 transition-all duration-200"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              ดูคำขอของฉัน
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.replace("/dashboard")}
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 hover:bg-white/30 rounded-xl h-12 font-medium transition-all duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </Button>
          </div>

          {/* ⭐ Auto redirect notification with countdown */}
          <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-3 border border-blue-200/30">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                เปลี่ยนหน้าอัตโนมัติใน {countdown} วินาที
              </span>
            </div>
          </div>
        </div>

        {/* ⭐ Floating particles effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-70"></div>
          <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce opacity-50"></div>
          <div className="absolute bottom-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60 animation-delay-1000"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
