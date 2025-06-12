"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { HeroAction } from "../../types/hero";

interface HeroActionsProps {
  actions: HeroAction[];
}

export function HeroActions({ actions }: HeroActionsProps) {
  const handleClick = (action: HeroAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      window.location.href = action.href;
    }
  };

  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-4"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
    >
      {actions.map((action, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => handleClick(action)}
            size="lg"
            variant={action.variant === "secondary" ? "ghost" : "default"}
            className={
              action.variant === "primary"
                ? "group bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                : "group border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-lg backdrop-blur-sm transition-all duration-300"
            }
          >
            {action.label}
            {action.icon}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
