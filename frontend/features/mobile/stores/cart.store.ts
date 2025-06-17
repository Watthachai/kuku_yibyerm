"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (productId: string, productName: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updatePurpose: (itemId: string, purpose: string) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Selectors
  getTotalItems: () => number;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      error: null,

      addItem: (productId: string, productName: string, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === productId);
        
        if (existingItem) {
          get().updateQuantity(productId, existingItem.quantity + quantity);
        } else {
          const newItem: CartItem = {
            id: crypto.randomUUID(),
            productId,
            productName,
            quantity,
            purpose: '',
            addedAt: new Date().toISOString(),
          };
          
          set(state => ({
            items: [...state.items, newItem],
          }));
        }
      },

      removeItem: (itemId: string) => {
        set(state => ({
          items: state.items.filter(item => 
            item.id !== itemId && item.productId !== itemId
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
        }));
      },

      updatePurpose: (itemId: string, purpose: string) => {
        set(state => ({
          items: state.items.map(item => 
            item.id === itemId || item.productId === itemId
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
        }));
      },

      clearCart: () => {
        set({ items: [], error: null });
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
    }),
    {
      name: 'mobile-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items,
      }),
    }
  )
);