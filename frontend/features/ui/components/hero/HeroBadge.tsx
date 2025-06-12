"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface HeroBadgeProps {
  icon: React.ReactNode;
  text: string;
}

export function HeroBadge({ icon, text }: HeroBadgeProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        duration: 1,
        delay: 0.2,
        type: "spring",
        stiffness: 100,
      }}
    >
      <Badge
        variant="secondary"
        className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 shadow-lg text-white hover:bg-white/25 transition-colors"
      >
        {icon}
        <span className="text-sm font-medium tracking-wide">{text}</span>
      </Badge>
    </motion.div>
  );
}
