"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingCartButtonProps {
  itemCount: number;
  onClick: () => void;
}

export function FloatingCartButton({
  itemCount,
  onClick,
}: FloatingCartButtonProps) {
  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-24 right-6 z-40"
        >
          <Button
            onClick={onClick}
            className="bg-ku-green hover:bg-ku-green-dark text-white rounded-full shadow-lg w-14 h-14 relative"
            size="lg"
          >
            <ShoppingCart className="w-6 h-6" />
            <motion.span
              key={itemCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold"
            >
              {itemCount > 99 ? "99+" : itemCount}
            </motion.span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}