"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddInventoryForm } from "./add-inventory-form";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddInventoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddInventoryDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // ลบ gap-0 และ p-0 ออก ใช้ default แทน
          "overflow-hidden flex flex-col",
          // Responsive sizing
          "w-[95vw] h-[95vh] max-w-none max-h-none",
          "sm:w-[90vw] sm:h-[90vh]",
          "md:w-[85vw] md:h-[85vh]",
          "lg:w-[80vw] lg:h-[85vh] lg:max-w-[1200px]",
          "xl:w-[75vw] xl:h-[80vh] xl:max-w-[1400px]",
          "2xl:w-[70vw] 2xl:h-[80vh] 2xl:max-w-[1600px]"
        )}
      >
        {/* Custom Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-20 rounded-full h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-sm"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">ปิด</span>
        </Button>

        {/* Header - Fixed */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-ku-green/5 to-ku-green/10 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900 pr-12">
            เพิ่มครุภัณฑ์ใหม่
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            กรอกข้อมูลครุภัณฑ์ที่ต้องการเพิ่มเข้าระบบ ระบบจะสร้าง QR Code
            อัตโนมัติ
          </DialogDescription>
        </DialogHeader>

        {/* Content - Scrollable - ให้ flex-1 และ overflow-hidden */}
        <div className="flex-1 overflow-hidden min-h-0">
          <AddInventoryForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
