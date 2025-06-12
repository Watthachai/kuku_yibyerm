"use client";

import { motion } from "framer-motion";
import { Smartphone, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeviceMockup() {
  return (
    <div className="relative lg:h-[600px] flex items-center justify-center">
      {/* Main Phone Mockup */}
      <motion.div
        className="relative z-20"
        initial={{ x: 100, opacity: 0, rotateY: -30 }}
        animate={{ x: 0, opacity: 1, rotateY: 0 }}
        transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
      >
        <div className="w-72 h-[580px] bg-white rounded-3xl shadow-2xl p-2 relative">
          <div className="w-full h-full bg-gray-900 rounded-2xl overflow-hidden relative">
            {/* Status Bar */}
            <div className="bg-white h-8 flex items-center justify-between px-4 text-xs font-medium text-gray-900">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-green-500 rounded-sm" />
                <div className="w-6 h-3 border border-gray-400 rounded-sm relative">
                  <div className="w-4 h-1.5 bg-green-500 rounded-sm absolute top-0.5 left-0.5" />
                </div>
              </div>
            </div>

            {/* App Content */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 h-full p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">แดชบอร์ด</h3>
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-4">
                <div className="h-32 bg-gradient-to-r from-emerald-400 to-green-500 relative">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-white font-semibold text-sm mb-1">
                      ระบบจัดการการยืม-คืนอุปกรณ์
                    </h4>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-xs mb-1">
                      จาก ผู้ดูแลระบบ
                    </p>
                    <h5 className="text-gray-900 font-medium text-sm leading-tight">
                      อัปเดตระบบและการใช้งานใหม่
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop Preview */}
      <motion.div
        className="absolute -top-10 -right-6 z-10"
        initial={{ x: 150, y: -50, opacity: 0, rotateX: -15 }}
        animate={{ x: 0, y: 0, opacity: 1, rotateX: 0 }}
        transition={{ duration: 1.4, delay: 1.2, ease: "easeOut" }}
      >
        <div className="w-80 h-48 bg-gray-900 rounded-lg shadow-xl overflow-hidden transform rotate-3">
          <div className="bg-gray-800 h-6 flex items-center gap-2 px-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 h-full p-4 relative">
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 text-white">
              <h6 className="text-sm font-semibold mb-2">
                คู่มือการใช้งานระบบ YibYerm สำหรับบุคลากร
              </h6>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 bg-white/20 rounded-full" />
                <span>ทีมพัฒนาระบบ</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Bubble */}
      <motion.div
        className="absolute bottom-10 -left-8 z-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.0, type: "spring" }}
      >
        <div className="bg-white rounded-2xl p-4 shadow-lg max-w-xs relative">
          <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white transform rotate-45" />
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-gray-500">ยินดีต้อนรับ 👋</span>
          </div>
          <p className="text-sm text-gray-900 font-medium">
            ต้องการความช่วยเหลือในการใช้งานระบบหรือไม่?
          </p>
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1"
            >
              ดูคู่มือ
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
