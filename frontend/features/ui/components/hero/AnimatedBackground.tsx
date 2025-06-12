"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  const orbs = [
    {
      className:
        "absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl",
      animation: {
        y: [-30, 0, -30],
        x: [20, -20, 20],
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.7, 0.3],
      },
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    {
      className:
        "absolute top-40 right-20 w-24 h-24 bg-emerald-300/20 rounded-full blur-lg",
      animation: {
        y: [0, -30, 0],
        x: [-20, 20, -20],
        scale: [1.1, 1, 1.1],
        opacity: [0.7, 0.3, 0.7],
      },
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      },
    },
    {
      className:
        "absolute bottom-32 left-1/4 w-20 h-20 bg-green-300/15 rounded-full blur-md",
      animation: {
        y: [-20, 20, -20],
        x: [10, -10, 10],
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      },
      transition: {
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2,
      },
    },
  ];

  return (
    <div className="absolute inset-0">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={orb.className}
          animate={orb.animation}
          transition={orb.transition}
        />
      ))}
    </div>
  );
}
