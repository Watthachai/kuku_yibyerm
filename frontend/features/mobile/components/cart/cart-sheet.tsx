"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingCart, X } from "lucide-react";
import { useCart } from "../../hooks/use-cart";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const {
    cart,
    isLoading,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    submitCartRequest,
    validateCart,
  } = useCart();

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateCartQuantity(productId, quantity);
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
      alert('กรุณากรอกวัตถุประสงค์ให้ครบถ้วน');
      return;
    }
    
    try {
      await submitCartRequest();
      onClose();
    } catch (error) {
      console.error('Error submitting requisition request:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-20 shadow-sm">
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
              {cart.length > 0 && (
                <p className="text-sm text-gray-600">{cart.length} รายการ</p>
              )}
            </div>
          </div>

          {cart.length > 0 && (
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

      {/* Content */}
      <div className="flex-1 pb-20">
        {cart.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
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
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.product.category.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    สูงสุด: {item.product.availableQuantity} ชิ้น
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>

                    <span className="w-8 text-center font-medium">{item.quantity}</span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.availableQuantity}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6 border">
              <h3 className="font-medium text-gray-900 mb-2">สรุปคำขอ</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>จำนวนรายการ:</span>
                  <span className="font-medium">{cart.length} รายการ</span>
                </div>
                <div className="flex justify-between">
                  <span>จำนวนชิ้นทั้งหมด:</span>
                  <span className="font-medium">
                    {cart.reduce((total, item) => total + item.quantity, 0)} ชิ้น
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button - Fixed at bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
          <div className="max-w-lg mx-auto">
            <Button
              onClick={handleSubmitRequest}
              disabled={isLoading || !validateCart()}
              className="w-full bg-ku-green hover:bg-ku-green-dark h-12 text-base font-medium"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  กำลังส่งคำขอ...
                </div>
              ) : (
                `ส่งคำขอเบิก (${cart.reduce((total, item) => total + item.quantity, 0)} ชิ้น)`
              )}
            </Button>

            {!validateCart() && cart.length > 0 && (
              <p className="text-center text-sm text-red-600 mt-2">
                กรุณากรอกวัตถุประสงค์ให้ครบถ้วนทุกรายการ
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}