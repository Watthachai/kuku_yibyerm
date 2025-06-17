"use client";

import { useCartStore } from '../stores/cart.store';
import { Product } from '../types/product.types';
import { RequestPeriod } from '../types/cart.types';
import { toast } from 'sonner';

export function useCart() {
  const {
    cart,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    updateItemPurpose,
    updateItemNotes,
    updateItemPeriod,
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
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  const removeFromCart = (productId: string) => {
    const item = getCartItem(productId);
    if (item) {
      removeItem(productId);
      toast.success(`ลบ ${item.product.name} ออกจากตะกร้าแล้ว`);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const item = getCartItem(productId);
    if (item && quantity > item.product.availableQuantity) {
      toast.error(`จำนวนเกินที่มีอยู่ (${item.product.availableQuantity})`);
      return;
    }
    updateQuantity(productId, quantity);
  };

  const submitCartRequest = async () => {
    try {
      await submitRequest();
      toast.success('ส่งคำขอสำเร็จ!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  return {
    // State
    cart,
    isLoading,
    error,
    
    // Actions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateItemPurpose,
    updateItemNotes,
    updateItemPeriod,
    clearCart,
    
    // Selectors
    getTotalItems,
    getItemQuantity,
    isInCart,
    getCartItem,
    
    // Validation & Submission
    validateCart,
    submitCartRequest,
  };
}