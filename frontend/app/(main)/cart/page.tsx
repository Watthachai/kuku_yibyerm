"use client";

import { useRouter } from "next/navigation";
import { CartSheet } from "@/features/mobile/components/cart/cart-sheet";

export default function CartPage() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
        <CartSheet
          isOpen={true}
          onClose={handleClose}
        />

  );
}