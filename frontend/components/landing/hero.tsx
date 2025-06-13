"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function LandingHero() {
  const router = useRouter();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.8, delay: 0.2 },
  };

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <motion.div className="flex justify-center mb-8" {...scaleIn}>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl">
              <Package className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            {...fadeInUp}
          >
            ระบบจัดการครุภัณฑ์
            <br />
            <span className="text-green-200">มหาวิทยาลัยเกษตรศาสตร์</span>
          </motion.h1>

          <motion.p
            className="text-xl text-white/90 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            แพลตฟอร์มเดียวสำหรับการบริหารจัดการ เบิก-คืน และติดตามสถานะครุภัณฑ์
            ของมหาวิทยาลัยอย่างมีประสิทธิภาพ
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={() => router.push("/sign-in")}
              className="bg-white text-ku-green hover:bg-gray-100 shadow-lg group transition-all duration-300"
            >
              เริ่มต้นใช้งาน
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              เรียนรู้เพิ่มเติม
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-300/10 rounded-full blur-3xl"></div>
    </div>
  );
}
