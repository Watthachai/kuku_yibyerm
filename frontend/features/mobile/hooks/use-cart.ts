"use client";

import { useCartStore } from "../stores/cart.store";
import { Product } from "../types/product.types";
import { RequestPeriod } from "../types/cart.types";
import { toast } from "sonner";

export function useCart() {
  const {
    items: cart = [], // ⭐ เพิ่ม default value
    isLoading,
    error,
    globalPurpose, // ⭐ เพิ่ม global purpose
    globalNotes, // ⭐ เพิ่ม global notes
    addItem,
    removeItem,
    updateQuantity,
    updateItemPurpose,
    updateItemNotes,
    updateGlobalPurpose, // ⭐ เพิ่มฟังก์ชันอัปเดต global purpose
    updateGlobalNotes, // ⭐ เพิ่มฟังก์ชันอัปเดต global notes
    clearCart,
    getTotalItems,
    getItemQuantity,
    isInCart,
    getCartItem,
    validateCart,
    submitRequest,
  } = useCartStore();

  const addToCart = async (
    product: Product,
    quantity: number = 1,
    period?: Partial<RequestPeriod>
  ) => {
    try {
      await addItem(product, quantity, period);
      toast.success(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  };

  const removeFromCart = (productId: string) => {
    const item = getCartItem(productId);
    if (item) {
      removeItem(productId);
      toast.success(`ลบ ${item.product.name} ออกจากตะกร้าแล้ว`);
    }
  };

  const submitCartRequest = async () => {
    console.log("🎯 [HOOK] submitCartRequest called");
    try {
      console.log("🎯 [HOOK] Calling store submitRequest...");
      const result = await submitRequest();
      console.log("🎯 [HOOK] Store returned result:", result);

      // ⭐ ไม่แสดง toast ที่นี่ เพราะจะ redirect ทันที
      // toast.success("ส่งคำขอเบิกสำเร็จ!");
      console.log("🎯 [HOOK] Returning result to component:", result);
      return result; // ⭐ Return result
    } catch (error) {
      console.error("❌ [HOOK] Error in submitCartRequest:", error);
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
      throw error; // ⭐ Re-throw error
    }
  };

  return {
    // State
    cart: cart || [], // ⭐ เพิ่ม fallback
    isLoading: isLoading || false,
    error,
    globalPurpose: globalPurpose || "", // ⭐ เพิ่ม global purpose
    globalNotes: globalNotes || "", // ⭐ เพิ่ม global notes

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemPurpose,
    updateItemNotes,
    updateGlobalPurpose, // ⭐ เพิ่มฟังก์ชันอัปเดต global purpose
    updateGlobalNotes, // ⭐ เพิ่มฟังก์ชันอัปเดต global notes
    clearCart,

    // Selectors
    getTotalItems: getTotalItems || (() => 0),
    getItemQuantity: getItemQuantity || (() => 0),
    isInCart: isInCart || (() => false),
    getCartItem: getCartItem || (() => null),

    // Validation & Submission
    validateCart: validateCart || (() => true),
    submitRequest: submitCartRequest,
  };
}
