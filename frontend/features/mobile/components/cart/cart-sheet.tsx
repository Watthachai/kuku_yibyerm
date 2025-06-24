"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2, ShoppingCart, X } from "lucide-react";
import { useCart } from "../../hooks/use-cart";
import { useRouter } from "next/navigation";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const router = useRouter();
  const {
    cart,
    isLoading,
    updateQuantity,
    updateItemPurpose,
    updateItemNotes,
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
    if (!validateCart()) {
      setShowPurposeForm(true);
      return;
    }

    try {
      // ⭐ รับ result กลับมา
      const result = await submitRequest();
      onClose();

      // ⭐ ตรวจสอบ result ก่อนใช้ .id
      if (result && result.id) {
        // Redirect ไป Success Page
        router.push(`/success?requestId=${result.id}`);
      } else {
        // ถ้าไม่มี id หรือ result เป็น undefined ให้ไปหน้า requests
        console.warn("No request ID returned, redirecting to requests page");
        router.push("/requests");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-50 flex flex-col">
      {/* Modern Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="mr-3 p-2 rounded-xl hover:bg-white/60 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ตะกร้าของฉัน</h1>
              {cartItems.length > 0 && (
                <p className="text-sm text-gray-600">
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
              className="text-red-600 hover:text-red-700 hover:bg-red-50/60 p-2 rounded-xl backdrop-blur-sm transition-all duration-200"
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
            <div className="w-24 h-24 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ตะกร้าว่างเปล่า
            </h3>
            <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
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
                className="bg-white/60 backdrop-blur-sm rounded-2xl border-0 shadow-xl p-6 space-y-4"
              >
                {/* Product Info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {item.product?.name || "สินค้าไม่ระบุ"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {item.product?.category?.name || "หมวดหมู่ไม่ระบุ"}
                    </p>
                    <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block">
                      สูงสุด: {item.product?.stock || 0} ชิ้น
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50/60 p-2 rounded-xl backdrop-blur-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quantity Controls */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
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
                        className="h-10 w-10 p-0 rounded-xl bg-white/60 border-gray-200/50 hover:bg-white/80"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg text-blue-600">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= (item.product?.stock || 0)}
                        className="h-10 w-10 p-0 rounded-xl bg-white/60 border-gray-200/50 hover:bg-white/80"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Purpose Input */}
                <div className="space-y-3">
                  <Label
                    htmlFor={`purpose-${item.id}`}
                    className="text-sm font-semibold text-gray-700"
                  >
                    วัตถุประสงค์ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`purpose-${item.id}`}
                    value={item.purpose || ""}
                    onChange={(e) => updateItemPurpose(item.id, e.target.value)}
                    placeholder="ระบุวัตถุประสงค์การใช้งาน"
                    className={`bg-white/80 backdrop-blur-sm border-gray-200/50 rounded-xl focus:bg-white/90 transition-all duration-200 ${
                      !item.purpose && showPurposeForm
                        ? "border-red-400 bg-red-50/50"
                        : ""
                    }`}
                  />
                </div>

                {/* Notes Input */}
                <div className="space-y-3">
                  <Label
                    htmlFor={`notes-${item.id}`}
                    className="text-sm font-semibold text-gray-700"
                  >
                    หมายเหตุ
                  </Label>
                  <Textarea
                    id={`notes-${item.id}`}
                    value={item.notes || ""}
                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                    placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                    rows={2}
                    className="bg-white/80 backdrop-blur-sm border-gray-200/50 rounded-xl focus:bg-white/90 transition-all duration-200"
                  />
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 mt-6 border-0 shadow-xl">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">สรุปคำขอ</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="text-gray-600">จำนวนรายการ:</span>
                  <span className="font-bold text-blue-600">
                    {cartItems.length} รายการ
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                  <span className="text-gray-600">จำนวนชิ้นทั้งหมด:</span>
                  <span className="font-bold text-blue-600">
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
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 p-4 shadow-2xl mb-16">
          <Button
            onClick={handleSubmitRequest}
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
            <div className="mt-3 p-3 bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-200/50">
              <p className="text-center text-sm text-red-600 font-medium">
                กรุณากรอกวัตถุประสงค์ให้ครบถ้วนทุกรายการ
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
