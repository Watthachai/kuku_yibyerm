import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, RequestPeriod } from "../types/cart.types";
import { Product } from "../types/product.types";
import { RequestService, RequestResponse } from "../services/request-service"; // ⭐ เพิ่ม RequestResponse import

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  globalPurpose: string; // ⭐ เพิ่มวัตถุประสงค์ส่วนกลาง
  globalNotes: string; // ⭐ เพิ่มหมายเหตุส่วนกลาง

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
  updateItemPurpose: (productId: string, purpose: string) => void; // ⭐ เก็บไว้เผื่อใช้ภายหลัง
  updateItemNotes: (productId: string, notes: string) => void; // ⭐ เก็บไว้เผื่อใช้ภายหลัง
  updateGlobalPurpose: (purpose: string) => void; // ⭐ เพิ่มฟังก์ชันอัปเดตวัตถุประสงค์ส่วนกลาง
  updateGlobalNotes: (notes: string) => void; // ⭐ เพิ่มฟังก์ชันอัปเดตหมายเหตุส่วนกลาง
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
      globalPurpose: "", // ⭐ เพิ่มวัตถุประสงค์ส่วนกลาง
      globalNotes: "", // ⭐ เพิ่มหมายเหตุส่วนกลาง

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
        try {
          const items = get().items || [];
          const existingItem = items.find(
            (item) => item.product.id === product.id.toString()
          );

          // ตรวจสอบ stock
          if (quantity > product.stock) {
            throw new Error(
              `ไม่สามารถเลือกได้ คงเหลือเพียง ${product.stock} ชิ้น`
            );
          }

          if (existingItem) {
            // ถ้ามีอยู่แล้ว ให้ update quantity
            get().updateQuantity(existingItem.id, quantity);
          } else {
            // ถ้าไม่มี ให้เพิ่มใหม่
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

      updateGlobalPurpose: (purpose) => {
        set({ globalPurpose: purpose });
      },

      updateGlobalNotes: (notes) => {
        set({ globalNotes: notes });
      },

      clearCart: () =>
        set({
          items: [],
          globalPurpose: "",
          globalNotes: "",
        }),

      // ⭐ เพิ่ม validateCart function
      validateCart: () => {
        const items = get().items || [];
        const globalPurpose = get().globalPurpose;

        if (items.length === 0) return false;

        // ตรวจสอบว่ามีวัตถุประสงค์ส่วนกลาง
        return !!(globalPurpose && globalPurpose.trim().length > 0);
      },

      // ⭐ อัปเดต submitRequest function
      submitRequest: async () => {
        const items = get().items || [];
        const globalPurpose = get().globalPurpose;
        const globalNotes = get().globalNotes;

        console.log("🚀 [STORE] Starting submitRequest...");
        console.log("📦 [STORE] Items:", items);
        console.log("🎯 [STORE] Purpose:", globalPurpose);
        console.log("📝 [STORE] Notes:", globalNotes);

        if (items.length === 0) {
          console.error("❌ [STORE] Cart is empty");
          throw new Error("ตะกร้าว่างเปล่า");
        }

        if (!get().validateCart()) {
          console.error("❌ [STORE] Validation failed");
          throw new Error("กรุณากรอกวัตถุประสงค์ให้ครบถ้วน");
        }

        try {
          set({ isLoading: true, error: null });

          // แปลงข้อมูลให้ตรงกับ Backend ต้องการ
          const requestData = {
            purpose: globalPurpose, // ⭐ ใช้วัตถุประสงค์ส่วนกลาง
            notes: globalNotes || "", // ⭐ ใช้หมายเหตุส่วนกลาง
            items: items.map((item) => ({
              product_id: parseInt(item.product.id),
              quantity: item.quantity,
            })),
          };

          console.log("📤 [STORE] Sending request data:", requestData);

          const result = await RequestService.createRequest(requestData);

          console.log("📥 [STORE] Received result:");
          console.log("📦 [STORE] Full result object:", result);
          console.log("🔍 [STORE] Result type:", typeof result);
          console.log(
            "🔍 [STORE] Result keys:",
            result ? Object.keys(result) : "No result"
          );
          console.log("🆔 [STORE] Result.id:", result?.id);
          console.log(
            "📋 [STORE] Result.request_number:",
            result?.request_number
          );

          // เคลียร์ตะกร้าหลังส่งสำเร็จ
          console.log("🧹 [STORE] Clearing cart...");
          get().clearCart();

          // ⭐ Return result เพื่อให้ component ใช้ redirect
          console.log("✅ [STORE] Returning result to component:", result);
          return result;
        } catch (error) {
          console.error("💥 [STORE] Failed to submit request:", error);
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
