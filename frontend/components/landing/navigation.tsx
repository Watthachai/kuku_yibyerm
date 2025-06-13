"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function LandingNavigation() {
  const router = useRouter();

  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-ku-green" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">KU Asset</h1>
                <p className="text-xs text-white/80">ระบบจัดการครุภัณฑ์</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push("/sign-in")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 transition-all duration-300"
            >
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
