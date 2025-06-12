"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface BottomMessageBarProps {
  message: string;
}

export function BottomMessageBar({ message }: BottomMessageBarProps) {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm py-4"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 2.5 }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-200 text-sm">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          <span>{message}</span>
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
  );
}
