"use client";

import { motion } from "framer-motion";
import { AnimatedBackground } from "@/features/ui/components/hero/AnimatedBackground";
import { HeroBadge } from "@/features/ui/components/hero/HeroBadge";
import { HeroTitle } from "@/features/ui/components/hero/HeroTitle";
import { HeroActions } from "@/features/ui/components/hero/HeroActions";
import { DeviceMockup } from "@/features/ui/components/hero/DeviceMockup";
import { BottomMessageBar } from "@/features/ui/components/hero/BottomMessageBar";
import { heroContent } from "@/features/ui/data/hero-content";

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* University Badge */}
            <HeroBadge
              icon={heroContent.badge.icon}
              text={heroContent.badge.text}
            />

            {/* Main Title */}
            <HeroTitle
              main={heroContent.title.main}
              highlight={heroContent.title.highlight}
              subtitle={heroContent.title.subtitle}
            />

            {/* Description */}
            <motion.p
              className="text-lg lg:text-xl text-emerald-100 leading-relaxed max-w-lg"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
            >
              {heroContent.description}
              <br />
              <span className="text-white font-semibold mt-4 block">
                {heroContent.highlight}
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <HeroActions actions={heroContent.actions} />

            {/* Status Message */}
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
              <span>{heroContent.statusMessage}</span>
            </motion.div>
          </div>

          {/* Right Side - Device Mockups */}
          <DeviceMockup />
        </div>
      </div>

      {/* Bottom Message Bar */}
      <BottomMessageBar message="ระบบ YibYerm จัดการการยืม-คืนสำหรับบุคลากรมหาวิทยาลัยเกษตรศาสตร์" />
    </section>
  );
}
