"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Play,
  Smartphone,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div>
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
            animate={{
              y: [-30, 0, -30],
              x: [20, -20, 20],
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-24 h-24 bg-emerald-300/20 rounded-full blur-lg"
            animate={{
              y: [0, -30, 0],
              x: [-20, 20, -20],
              scale: [1.1, 1, 1.1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-32 left-1/4 w-20 h-20 bg-green-300/15 rounded-full blur-md"
            animate={{
              y: [-20, 20, -20],
              x: [10, -10, 10],
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* University Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 shadow-lg"
              initial={{ y: -50, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.2,
                type: "spring",
                stiffness: 100,
              }}
            >
              <div className="relative">
                <BookOpen className="w-5 h-5" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-ping" />
              </div>
              <span className="text-sm font-medium tracking-wide">
                มหาวิทยาลัยเกษตรศาสตร์
              </span>
            </motion.div>

            {/* Main Heading */}
            <div>
              <motion.h1
                className="text-4xl lg:text-6xl font-bold leading-tight mb-6"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              >
                ระบบจัดการ{" "}
                <span className="bg-gradient-to-r from-emerald-200 via-white to-emerald-300 bg-clip-text text-transparent">
                  การยืม-คืน
                </span>
                <br />
                สำหรับบุคลากร
              </motion.h1>

              <motion.div
                className="flex items-center gap-2 text-emerald-200 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="h-px w-12 bg-emerald-200" />
                <span className="text-sm tracking-widest">YibYerm</span>
                <div className="h-px w-12 bg-emerald-200" />
              </motion.div>
            </div>

            {/* Subtitle */}
            <motion.p
              className="text-lg lg:text-xl text-emerald-100 leading-relaxed max-w-lg"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            >
              ระบบจัดการการยืม-คืนอุปกรณ์และทรัพยากรศึกษา สำหรับเจ้าหน้าที่
              อาจารย์ และผู้ดูแลระบบ
              <br />
              <span className="text-white font-semibold mt-4 block">
                จัดการได้ง่าย ตรวจสอบได้ทุกที่ ทุกเวลา
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="group bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  เข้าสู่ระบบ
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="group border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-lg backdrop-blur-sm transition-all duration-300"
                >
                  <Play className="mr-2 w-5 h-5" />
                  ดูคู่มือการใช้งาน
                </Button>
              </motion.div>
            </motion.div>

            {/* Bottom Message */}
            <motion.div
              className="flex items-center gap-3 text-emerald-200 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span>ระบบสำหรับบุคลากร</span>
              </div>
              <span>จัดการการยืม-คืนได้อย่างมีประสิทธิภาพ</span>
            </motion.div>
          </div>

          {/* Right Side - Device Mockups */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Main Phone Mockup */}
            <motion.div
              className="relative z-20"
              initial={{ x: 100, opacity: 0, rotateY: -30 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
            >
              <div className="w-72 h-[580px] bg-white rounded-3xl shadow-2xl p-2 relative">
                {/* Phone Frame */}
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
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">
                        แดชบอร์ด
                      </h3>
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Hero Image Card */}
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

                    {/* Article Preview */}
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

            {/* Floating Desktop Preview */}
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

            {/* Floating Chat Bubble */}
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
        </div>
      </div>

      {/* Bottom Message Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm py-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.5 }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-200 text-sm">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span>
              ระบบ YibYerm จัดการการยืม-คืนสำหรับบุคลากรมหาวิทยาลัยเกษตรศาสตร์
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white border border-white/30 hover:bg-white/10"
          >
            เริ่มใช้งาน
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
