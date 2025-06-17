"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  maxQuantity: number;
}

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onClearCart: () => void;
  totalPrice: number;
}

export function CartSheet({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartSheetProps) {
  const handleSubmitRequest = () => {
    // TODO: Implement request submission
    console.log("Submitting request for:", cart);
    onClearCart();
    onClose();
  };

  if (cart.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[50vh]">
          <SheetHeader>
            <SheetTitle>ตะกร้าของฉัน</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ตะกร้าว่างเปล่า
            </h3>
            <p className="text-gray-600">เพิ่มครุภัณฑ์ที่ต้องการยืมลงในตะกร้า</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>ตะกร้าของฉัน ({cart.length} รายการ)</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              ล้างทั้งหมด
            </Button>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-4 flex-1 overflow-y-auto">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  สูงสุด: {item.maxQuantity} ชิ้น
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>

                  <span className="w-8 text-center">{item.quantity}</span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onUpdateQuantity(item.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.maxQuantity}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter>
          <Button
            onClick={handleSubmitRequest}
            className="w-full bg-ku-green hover:bg-ku-green-dark"
          >
            ส่งคำขอยืม ({cart.reduce((total, item) => total + item.quantity, 0)}{" "}
            รายการ)
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}