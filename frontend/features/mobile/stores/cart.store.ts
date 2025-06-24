import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, RequestPeriod } from "../types/cart.types";
import { Product } from "../types/product.types";
import { RequestService, RequestResponse } from "../services/request-service"; // ⭐ เพิ่ม RequestResponse import

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addItem: (
    product: Product,
    quantity?: number,
    period?: Partial<RequestPeriod>
  ) => void;
  setItemQuantity: (
    product: Product,
    quantity: number,
    period?: Partial<RequestPeriod>
  ) => void; // ⭐ เพิ่มฟังก์ชันสำหรับ set quantity
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemPurpose: (productId: string, purpose: string) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  clearCart: () => void;

  // Validation & Submission
  validateCart: () => boolean;
  submitRequest: () => Promise<RequestResponse>; // ⭐ ใช้ RequestResponse type

  // Selectors
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
  getCartItem: (productId: string) => CartItem | null;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      error: null,

      addItem: async (
        product: Product,
        quantity: number = 1,
        period?: Partial<RequestPeriod>
      ) => {
        try {
          const items = get().items || [];
          const existingItem = items.find(
            (item) => item.product.id === product.id.toString()
          );

          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            // ⭐ ตรวจสอบ stock แทน quantity
            if (newQuantity > product.stock) {
              throw new Error(
                `ไม่สามารถเพิ่มได้ คงเหลือเพียง ${product.stock} ชิ้น`
              );
            }

            get().updateQuantity(existingItem.id, newQuantity);
          } else {
            // ⭐ ตรวจสอบ stock สำหรับรายการใหม่
            if (quantity > product.stock) {
              throw new Error(
                `ไม่สามารถเพิ่มได้ คงเหลือเพียง ${product.stock} ชิ้น`
              );
            }

            const newItem: CartItem = {
              id: `${product.id}-${Date.now()}`,
              product: {
                id: product.id.toString(),
                code: product.code || "",
                name: product.name,
                description: product.description,
                brand: product.brand,
                productModel: product.productModel,
                stock: product.stock,
                minStock: product.minStock || 0,
                unit: product.unit || "ชิ้น",
                status: product.status || "ACTIVE",
                imageUrl: product.imageUrl,
                category: product.category,
                createdAt: product.createdAt || new Date().toISOString(),
                updatedAt: product.updatedAt || new Date().toISOString(),
              },
              quantity,
              purpose: "",
              notes: "",
              priority: "NORMAL", // ⭐ เพิ่ม priority
              addedAt: new Date().toISOString(), // ⭐ เพิ่ม addedAt
              requestPeriod: {
                startDate: period?.startDate || new Date().toISOString(),
                endDate:
                  period?.endDate ||
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                duration: period?.duration || 7,
                isFlexible: period?.isFlexible || false, // ⭐ เพิ่ม isFlexible
              },
            };

            set((state) => ({
              items: [...(state.items || []), newItem],
            }));
          }
        } catch (error) {
          console.error("Failed to add item to cart:", error);
          throw error;
        }
      },

      // ⭐ เพิ่มฟังก์ชัน setItemQuantity ที่จะ set quantity แทนการ add
      setItemQuantity: async (
        product: Product,
        quantity: number,
        period?: Partial<RequestPeriod>
      ) => {
        console.log("🛒 setItemQuantity called:", {
          productId: product.id,
          productName: product.name,
          quantity,
          currentItems: get().items.length,
        });

        try {
          const items = get().items || [];
          const existingItem = items.find(
            (item) => item.product.id === product.id.toString()
          );

          console.log("🔍 Existing item search:", {
            searching: product.id.toString(),
            found: existingItem ? existingItem.id : "not found",
            allItemIds: items.map((item) => ({
              itemId: item.id,
              productId: item.product.id,
            })),
          });

          // ตรวจสอบ stock
          if (quantity > product.stock) {
            throw new Error(
              `ไม่สามารถเลือกได้ คงเหลือเพียง ${product.stock} ชิ้น`
            );
          }

          if (existingItem) {
            // ถ้ามีอยู่แล้ว ให้ update quantity
            console.log(
              "✏️ Updating existing item:",
              existingItem.id,
              "to quantity:",
              quantity
            );
            get().updateQuantity(existingItem.id, quantity);
          } else {
            // ถ้าไม่มี ให้เพิ่มใหม่
            console.log("➕ Creating new item for product:", product.id);
            const newItem: CartItem = {
              id: `${product.id}-${Date.now()}`,
              product: {
                id: product.id.toString(),
                code: product.code || "",
                name: product.name,
                description: product.description,
                brand: product.brand,
                productModel: product.productModel,
                stock: product.stock,
                minStock: product.minStock || 0,
                unit: product.unit || "ชิ้น",
                status: product.status || "ACTIVE",
                imageUrl: product.imageUrl,
                category: product.category,
                createdAt: product.createdAt || new Date().toISOString(),
                updatedAt: product.updatedAt || new Date().toISOString(),
              },
              quantity,
              purpose: "",
              notes: "",
              priority: "NORMAL",
              addedAt: new Date().toISOString(),
              requestPeriod: {
                startDate: period?.startDate || new Date().toISOString(),
                endDate:
                  period?.endDate ||
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                duration: period?.duration || 7,
                isFlexible: period?.isFlexible || false,
              },
            };

            set((state) => ({
              items: [...(state.items || []), newItem],
            }));
          }
        } catch (error) {
          console.error("Failed to set item quantity:", error);
          throw error;
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: (state.items || []).filter((item) => item.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: (state.items || []).map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      updateItemPurpose: (productId, purpose) => {
        set((state) => ({
          items: (state.items || []).map((item) =>
            item.id === productId ? { ...item, purpose } : item
          ),
        }));
      },

      updateItemNotes: (productId, notes) => {
        set((state) => ({
          items: (state.items || []).map((item) =>
            item.id === productId ? { ...item, notes } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      // ⭐ เพิ่ม validateCart function
      validateCart: () => {
        const items = get().items || [];
        if (items.length === 0) return false;

        // ตรวจสอบว่าทุกรายการมี purpose
        return items.every(
          (item) => item.purpose && item.purpose.trim().length > 0
        );
      },

      // ⭐ อัปเดต submitRequest function
      submitRequest: async () => {
        const items = get().items || [];

        if (items.length === 0) {
          throw new Error("ตะกร้าว่างเปล่า");
        }

        if (!get().validateCart()) {
          throw new Error("กรุณากรอกวัตถุประสงค์ให้ครบถ้วนทุกรายการ");
        }

        try {
          set({ isLoading: true, error: null });

          // แปลงข้อมูลให้ตรงกับ Backend ต้องการ
          const requestData = {
            purpose: items[0].purpose, // ใช้วัตถุประสงค์ของรายการแรกเป็นหลัก
            notes: items
              .map((item) => item.notes)
              .filter(Boolean)
              .join("; "),
            items: items.map((item) => ({
              product_id: parseInt(item.id),
              quantity: item.quantity,
            })),
          };

          console.log("Submitting request data:", requestData);

          const result = await RequestService.createRequest(requestData);

          // เคลียร์ตะกร้าหลังส่งสำเร็จ
          get().clearCart();

          // ⭐ Return result เพื่อให้ component ใช้ redirect
          return result;
        } catch (error) {
          console.error("Failed to submit request:", error);
          set({
            error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Selectors
      getItemQuantity: (productId) => {
        const items = get().items || [];
        const item = items.find((item) => item.product.id === productId);
        return item ? item.quantity : 0;
      },

      getTotalItems: () => {
        const items = get().items || [];
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getCartItem: (productId) => {
        const items = get().items || [];
        return items.find((item) => item.product.id === productId) || null;
      },

      isInCart: (productId) => {
        const items = get().items || [];
        return items.some((item) => item.product.id === productId);
      },
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        if (state && !state.items) {
          state.items = [];
        }
      },
    }
  )
);
