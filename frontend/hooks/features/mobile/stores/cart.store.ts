"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createRequest } from '@/lib/actions/request.actions';
import { Product } from '../types/product.types';
import { CartItem as CartItemType, RequestPeriod } from '../types/cart.types';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  purpose: string;
  notes?: string;
  addedAt: string;
}

interface CartStore {
  // State
  items: CartItem[];
  cart: CartItemType[]; // เพิ่ม cart property
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (product: Product, quantity?: number, period?: Partial<RequestPeriod>) => void; // แก้ signature
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updatePurpose: (itemId: string, purpose: string) => void;
  updateNotes: (itemId: string, notes: string) => void;
  updateItemPurpose: (itemId: string, purpose: string) => void; // เพิ่ม
  updateItemNotes: (itemId: string, notes: string) => void; // เพิ่ม
  updateItemPeriod: (itemId: string, period: RequestPeriod) => void; // เพิ่ม
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Selectors
  getTotalItems: () => number;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItemType | undefined; // เพิ่ม
  validateCart: () => boolean; // เพิ่ม
  submitRequest: () => Promise<void>; // เพิ่ม
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cart: [], // เพิ่ม cart property
      isOpen: false,
      isLoading: false,
      error: null,

      addItem: (product: Product, quantity = 1, period?: Partial<RequestPeriod>) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === product.id);
        
        if (existingItem) {
          get().updateQuantity(product.id, existingItem.quantity + quantity);
        } else {
          const newItem: CartItem = {
            id: crypto.randomUUID(),
            productId: product.id,
            productName: product.name,
            quantity,
            purpose: '',
            addedAt: new Date().toISOString(),
          };
          
          // สร้าง cart item ด้วย
          const newCartItem: CartItemType = {
            id: newItem.id,
            product: product,
            quantity,
            requestPeriod: {
              startDate: period?.startDate || new Date().toISOString(),
              endDate: period?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              duration: period?.duration || 7,
              isFlexible: period?.isFlexible || false,
            },
            purpose: '',
            priority: 'NORMAL',
            addedAt: new Date().toISOString(),
          };
          
          set(state => ({
            items: [...state.items, newItem],
            cart: [...state.cart, newCartItem],
          }));
        }
      },

      removeItem: (itemId: string) => {
        set(state => ({
          items: state.items.filter(item => 
            item.id !== itemId && item.productId !== itemId
          ),
          cart: state.cart.filter(item =>
            item.id !== itemId && item.product.id !== itemId
          ),
        }));
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set(state => ({
          items: state.items.map(item => 
            item.id === itemId || item.productId === itemId
              ? { ...item, quantity }
              : item
          ),
          cart: state.cart.map(item =>
            item.id === itemId || item.product.id === itemId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      updatePurpose: (itemId: string, purpose: string) => {
        set(state => ({
          items: state.items.map(item => 
            item.id === itemId || item.productId === itemId
              ? { ...item, purpose }
              : item
          ),
          cart: state.cart.map(item =>
            item.id === itemId || item.product.id === itemId
              ? { ...item, purpose }
              : item
          ),
        }));
      },

      updateNotes: (itemId: string, notes: string) => {
        set(state => ({
          items: state.items.map(item => 
            item.id === itemId || item.productId === itemId
              ? { ...item, notes }
              : item
          ),
          cart: state.cart.map(item =>
            item.id === itemId || item.product.id === itemId
              ? { ...item, notes }
              : item
          ),
        }));
      },

      // เพิ่ม alias methods
      updateItemPurpose: (itemId: string, purpose: string) => {
        get().updatePurpose(itemId, purpose);
      },

      updateItemNotes: (itemId: string, notes: string) => {
        get().updateNotes(itemId, notes);
      },

      updateItemPeriod: (itemId: string, period: RequestPeriod) => {
        set(state => ({
          cart: state.cart.map(item =>
            item.id === itemId || item.product.id === itemId
              ? { ...item, requestPeriod: period }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], cart: [], error: null });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getItemQuantity: (productId: string) => {
        const { items } = get();
        const item = items.find(item => item.productId === productId);
        return item?.quantity || 0;
      },

      isInCart: (productId: string) => {
        const { items } = get();
        return items.some(item => item.productId === productId);
      },

      getCartItem: (productId: string) => {
        const { cart } = get();
        return cart.find(item => item.product.id === productId);
      },

      validateCart: () => {
        const { cart } = get();
        return cart.every(item => 
          item.purpose.trim().length > 0 && 
          item.quantity > 0 && 
          item.quantity <= item.product.availableQuantity
        );
      },

      submitRequest: async () => {
        const { cart, validateCart } = get();
        
        if (!validateCart()) {
          throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }

        if (cart.length === 0) {
          throw new Error('ตะกร้าว่างเปล่า');
        }

        set({ isLoading: true, error: null });
        
        try {
          // เตรียม FormData สำหรับ Server Action
          const formData = new FormData();
          formData.append('purpose', cart[0]?.purpose || 'เบิกครุภัณฑ์เพื่อใช้งาน');
          formData.append('notes', 'คำขอจากระบบ Mobile');
          formData.append('items', JSON.stringify(
            cart.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              purpose: item.purpose || 'เบิกครุภัณฑ์เพื่อใช้งาน',
              notes: item.notes,
            }))
          ));

          // เรียก Server Action
          await createRequest(formData);
          
          // Clear cart after successful submission
          get().clearCart();
          
          toast({
            title: "สำเร็จ",
            description: "ส่งคำขอเบิกครุภัณฑ์เรียบร้อยแล้ว",
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งคำขอ';
          set({ error: errorMessage });
          
          toast({
            title: "เกิดข้อผิดพลาด",
            description: errorMessage,
            variant: "destructive",
          });
          
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);