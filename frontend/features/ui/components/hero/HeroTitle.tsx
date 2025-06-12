"use client";

import { motion } from "framer-motion";

interface HeroTitleProps {
  main: string;
  highlight: string;
  subtitle: string;
}

export function HeroTitle({ main, highlight, subtitle }: HeroTitleProps) {
  return (
    <div>
      <motion.h1
        className="text-4xl lg:text-6xl font-bold leading-tight mb-6"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
      >
        {main}{" "}
        <span className="bg-gradient-to-r from-emerald-200 via-white to-emerald-300 bg-clip-text text-transparent">
          {highlight}
        </span>
        <br />
        {subtitle}
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
  );
}
