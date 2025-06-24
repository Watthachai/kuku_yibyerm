"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddProductForm } from "./add-product-form";
import { cn } from "@/lib/utils";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProductDialogProps) {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // ⭐ Base sizing - ใช้พื้นที่เต็มที่บน mobile
          "w-[100vw] h-[100vh] max-w-none max-h-none p-0 flex flex-col overflow-hidden",
          // ⭐ Small screens (640px+) - เริ่มมี margin
          "sm:w-[95vw] sm:h-[95vh] sm:max-w-[95vw] sm:max-h-[95vh]",
          // ⭐ Medium screens (768px+) - ขนาดพอดี
          "md:w-[90vw] md:h-[90vh] md:max-w-[90vw] md:max-h-[90vh]",
          // ⭐ Large screens (1024px+) - กว้างแต่ไม่เกินไป
          "lg:w-[85vw] lg:h-[85vh] lg:max-w-[85vw] lg:max-h-[85vh]",
          // ⭐ Extra large (1280px+) - ใช้พื้นที่เหมาะสม
          "xl:w-[80vw] xl:h-[80vh] xl:max-w-[80vw] xl:max-h-[80vh]",
          // ⭐ 2XL screens (1536px+) - จำกัดขนาดสูงสุด
          "2xl:w-[75vw] 2xl:h-[75vh] 2xl:max-w-[1400px] 2xl:max-h-[900px]"
        )}
      >
        {/* ⭐ Header - Fixed */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b bg-white flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            เพิ่มสินค้า / ครุภัณฑ์ใหม่
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            กรอกข้อมูลสินค้าหรือครุภัณฑ์ที่ต้องการเพิ่มเข้าระบบ
          </p>
        </DialogHeader>

        {/* ⭐ Content - Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <AddProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
