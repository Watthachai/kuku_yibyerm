"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface FloatingCartButtonProps {
  itemCount: number;
  onClick: () => void;
}

export function FloatingCartButton({
  itemCount,
  onClick,
}: FloatingCartButtonProps) {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={onClick}
        className="bg-ku-green hover:bg-ku-green-dark text-white rounded-full shadow-lg w-14 h-14 relative"
      >
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
          {itemCount}
        </span>
      </Button>
    </div>
  );
}