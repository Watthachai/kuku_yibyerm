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
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {" "}
      {/* ⭐ เปลี่ยนเป็น fixed inset-0 */}
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="mr-2"
            >
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">ตะกร้าของฉัน</h1>
              {cartItems.length > 0 && (
                <p className="text-sm text-gray-600">
                  {cartItems.length} รายการ
                </p>
              )}
            </div>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
            <ShoppingCart className="w-20 h-20 text-gray-400 mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              ตะกร้าว่างเปล่า
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm">
              เพิ่มครุภัณฑ์ที่ต้องการยืมลงในตะกร้าเพื่อทำการส่งคำขอ
            </p>
            <Button
              onClick={onClose}
              className="bg-ku-green hover:bg-ku-green-dark"
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
                className="p-4 bg-gray-50 rounded-lg border space-y-4"
              >
                {/* Product Info */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {item.product?.name || "สินค้าไม่ระบุ"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.product?.category?.name || "หมวดหมู่ไม่ระบุ"}
                    </p>
                    <p className="text-xs text-gray-500">
                      สูงสุด: {item.product?.quantity || 0} ชิ้น{" "}
                      {/* ⭐ แสดงจำนวนสูงสุดที่เบิกได้ */}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">จำนวน:</span>
                  <div className="flex items-center space-x-2">
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
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= (item.product?.quantity || 0)} // ⭐ ตรวจสอบกับ stock
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Purpose Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor={`purpose-${item.id}`}
                    className="text-sm font-medium"
                  >
                    วัตถุประสงค์ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`purpose-${item.id}`}
                    value={item.purpose || ""}
                    onChange={(e) => updateItemPurpose(item.id, e.target.value)}
                    placeholder="ระบุวัตถุประสงค์การใช้งาน"
                    className={
                      !item.purpose && showPurposeForm ? "border-red-500" : ""
                    }
                  />
                </div>

                {/* Notes Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor={`notes-${item.id}`}
                    className="text-sm font-medium"
                  >
                    หมายเหตุ
                  </Label>
                  <Textarea
                    id={`notes-${item.id}`}
                    value={item.notes || ""}
                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                    placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                    rows={2}
                  />
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6 border">
              <h3 className="font-medium text-gray-900 mb-2">สรุปคำขอ</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>จำนวนรายการ:</span>
                  <span className="font-medium">{cartItems.length} รายการ</span>
                </div>
                <div className="flex justify-between">
                  <span>จำนวนชิ้นทั้งหมด:</span>
                  <span className="font-medium">{totalQuantity} ชิ้น</span>
                </div>
              </div>
            </div>

            {/* ⭐ เพิ่ม padding bottom เพื่อให้เนื้อหาไม่ถูกปุ่มบัง */}
            <div className="h-24"></div>
          </div>
        )}
      </div>
      {/* ⭐ Submit Button - Always visible at bottom */}
      {cartItems.length > 0 && (
        <div
          className="flex-shrink-0 bg-white border-t p-4 shadow-lg mb-16"
          style={{ zIndex: 9999 }}
        >
          {/* mb-16 = 64px เพื่อหลีกเลี่ยง bottom nav */}
          <Button
            onClick={handleSubmitRequest}
            disabled={isLoading}
            className="w-full bg-ku-green hover:bg-ku-green-dark h-12 text-base font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                กำลังส่งคำขอ...
              </div>
            ) : (
              `ส่งคำขอเบิก (${totalQuantity} ชิ้น)`
            )}
          </Button>

          {!validateCart() && showPurposeForm && (
            <p className="text-center text-sm text-red-600 mt-2">
              กรุณากรอกวัตถุประสงค์ให้ครบถ้วนทุกรายการ
            </p>
          )}
        </div>
      )}
    </div>
  );
}
