"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2, ShoppingCart, X } from "lucide-react";
import { useCart } from "../../hooks/use-cart";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  console.log("🔥 CART SHEET COMPONENT RENDERED", Date.now());

  const {
    cart,
    isLoading,
    globalPurpose, // ⭐ เพิ่ม global purpose
    globalNotes, // ⭐ เพิ่ม global notes
    updateQuantity,
    updateGlobalPurpose, // ⭐ ใช้แทน
    updateGlobalNotes, // ⭐ ใช้แทน
    removeFromCart,
    clearCart,
    submitRequest,
    validateCart,
  } = useCart();

  const [showPurposeForm, setShowPurposeForm] = useState(false);
  const cartItems = cart || [];

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
    onClose();
  };

  const handleSubmitRequest = async () => {
    console.log("🚀🚀🚀 [CART] FUNCTION CALLED - handleSubmitRequest");
    console.log("🚀 [CART] Starting request submission...");
    console.log("📋 [CART] Cart validation:", validateCart());
    console.log("🎯 [CART] Global purpose:", globalPurpose);
    console.log("📝 [CART] Global notes:", globalNotes);
    console.log("🛒 [CART] Cart items:", cartItems);

    if (!validateCart()) {
      console.log("❌ [CART] Validation failed, showing purpose form");
      setShowPurposeForm(true);
      return;
    }

    try {
      console.log("🔄 [CART] Calling submitRequest()...");

      // ⭐ รับ result กลับมา
      const result = await submitRequest();

      console.log("✅ [CART] Submit successful!");
      console.log("📦 [CART] Full result object:", result);
      console.log("🔍 [CART] Result type:", typeof result);
      console.log(
        "🔍 [CART] Result keys:",
        result ? Object.keys(result) : "No result"
      );
      console.log("� [CART] Result.id:", result?.id);
      console.log("📋 [CART] Result.request_number:", result?.request_number);

      // ⭐ ปิด cart sheet ก่อน redirect
      onClose();

      // ⭐ ตรวจสอบ result ว่ามี ID หรือไม่
      if (result) {
        let redirectId = null;

        if (result.id) {
          redirectId = result.id;
          console.log("🎯 [CART] Using result.id:", redirectId);
        } else if (result.request_number) {
          redirectId = result.request_number;
          console.log("🎯 [CART] Using result.request_number:", redirectId);
        } else {
          redirectId = Date.now().toString();
          console.log("🎯 [CART] Using timestamp fallback:", redirectId);
        }

        const successUrl = `/success?requestId=${redirectId}`;
        console.log("🎉 [CART] Redirecting to:", successUrl);

        // ⭐ ปิด cart sheet ก่อน redirect
        console.log("🎉 [CART] Before router.replace...");

        // ⭐ ใช้ window.location.replace เพื่อป้องกันการกลับมาหน้าเดิม
        console.log(
          "🎉 [CART] Using window.location.replace for better redirect"
        );
        window.location.replace(successUrl);

        console.log("🎉 [CART] window.location.replace called");
      } else {
        console.warn("⚠️ [CART] No result returned from submitRequest");
        console.log("🔄 [CART] Redirecting to success with timestamp");
        const fallbackUrl = `/success?requestId=${Date.now()}`;
        console.log("🔄 [CART] Fallback URL:", fallbackUrl);

        console.log("🔄 [CART] Using window.location.replace for fallback");
        window.location.replace(fallbackUrl);
      }
    } catch (error) {
      console.error("❌ [CART] Error submitting request:", error);
      console.error("🔍 [CART] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      // ⭐ ปิด cart sheet แม้จะเกิด error
      onClose();

      // ⭐ เมื่อเกิด error ให้ไปหน้า requests แทน
      console.log("🔄 [CART] Error occurred, redirecting to requests page");
      const errorUrl = "/requests";
      console.log("🔄 [CART] Error redirect URL:", errorUrl);

      console.log("🔄 [CART] Using window.location.replace for error redirect");
      window.location.replace(errorUrl);
    }
  };

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 z-50 flex flex-col">
      {/* Modern Header */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="mr-3 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ตะกร้าของฉัน
              </h1>
              {cartItems.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {cartItems.length} รายการ • {totalQuantity} ชิ้น
                </p>
              )}
            </div>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50/60 dark:hover:bg-red-900/30 p-2 rounded-xl backdrop-blur-sm transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              ล้างทั้งหมด
            </Button>
          )}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              ตะกร้าว่างเปล่า
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm leading-relaxed">
              เพิ่มครุภัณฑ์ที่ต้องการยืมลงในตะกร้าเพื่อทำการส่งคำขอ
            </p>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-ku-green to-emerald-600 hover:from-ku-green-dark hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg"
            >
              เลือกครุภัณฑ์
            </Button>
          </div>
        ) : (
          // Cart Items
          <div className="p-4 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border-0 shadow-xl p-6 space-y-4"
              >
                {/* Product Info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">
                      {item.product?.name || "สินค้าไม่ระบุ"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      {item.product?.category?.name || "หมวดหมู่ไม่ระบุ"}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg inline-block">
                      สูงสุด: {item.product?.stock || 0} ชิ้น
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50/60 dark:hover:bg-red-900/30 p-2 rounded-xl backdrop-blur-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quantity Controls */}
                <div className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100/50 dark:border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      จำนวน:
                    </span>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="h-10 w-10 p-0 rounded-xl bg-white/60 dark:bg-slate-600/60 border-gray-200/50 dark:border-slate-500/50 hover:bg-white/80 dark:hover:bg-slate-600/80"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg text-blue-600 dark:text-blue-400">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= (item.product?.stock || 0)}
                        className="h-10 w-10 p-0 rounded-xl bg-white/60 dark:bg-slate-600/60 border-gray-200/50 dark:border-slate-500/50 hover:bg-white/80 dark:hover:bg-slate-600/80"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* ⭐ Global Purpose และ Notes Section */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border-0 shadow-xl p-6 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4">
                ข้อมูลการขอเบิก
              </h3>

              {/* Global Purpose Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="global-purpose"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  วัตถุประสงค์ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="global-purpose"
                  value={globalPurpose}
                  onChange={(e) => updateGlobalPurpose(e.target.value)}
                  placeholder="ระบุวัตถุประสงค์การขอเบิกครุภัณฑ์ (เช่น เพื่อจัดงานสัมมนา)"
                  className={`bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 rounded-xl focus:bg-white/90 dark:focus:bg-slate-700/90 transition-all duration-200 ${
                    !globalPurpose && showPurposeForm
                      ? "border-red-400 bg-red-50/50 dark:bg-red-900/20"
                      : ""
                  }`}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  วัตถุประสงค์นี้จะใช้สำหรับทุกรายการในคำขอนี้
                </p>
              </div>

              {/* Global Notes Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="global-notes"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  หมายเหตุ
                </Label>
                <Textarea
                  id="global-notes"
                  value={globalNotes}
                  onChange={(e) => updateGlobalNotes(e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                  rows={3}
                  className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 rounded-xl focus:bg-white/90 dark:focus:bg-slate-700/90 transition-all duration-200"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 mt-6 border-0 shadow-xl">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">
                สรุปคำขอ
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-slate-700/60 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-300">
                    จำนวนรายการ:
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {cartItems.length} รายการ
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-slate-700/60 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-300">
                    จำนวนชิ้นทั้งหมด:
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {totalQuantity} ชิ้น
                  </span>
                </div>
              </div>
            </div>

            {/* Padding bottom for submit button */}
            <div className="h-32"></div>
          </div>
        )}
      </div>

      {/* Submit Button - Always visible at bottom */}
      {cartItems.length > 0 && (
        <div className="flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-slate-700/50 p-4 shadow-2xl mb-16">
          <Button
            onClick={() => {
              console.log("🔥🔥🔥 BUTTON CLICKED!", Date.now());
              handleSubmitRequest();
            }}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-ku-green to-emerald-600 hover:from-ku-green-dark hover:to-emerald-700 h-14 text-base font-semibold rounded-xl shadow-lg transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                กำลังส่งคำขอ...
              </div>
            ) : (
              `ส่งคำขอเบิก (${totalQuantity} ชิ้น)`
            )}
          </Button>

          {!validateCart() && showPurposeForm && (
            <div className="mt-3 p-3 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm rounded-xl border border-red-200/50 dark:border-red-700/50">
              <p className="text-center text-sm text-red-600 dark:text-red-400 font-medium">
                กรุณากรอกวัตถุประสงค์ให้ครบถ้วน
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
