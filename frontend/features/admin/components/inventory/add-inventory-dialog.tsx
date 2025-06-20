"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AddAssetFlow } from "./add-asset-flow"; // ⭐️ Import Flow หลักเข้ามา

interface AddInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void; // ฟังก์ชันสำหรับ Refresh ข้อมูล
}

export function AddInventoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddInventoryDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false); // ปิด Dialog เมื่อสำเร็จ
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "overflow-hidden flex flex-col p-0 gap-0", // จัดการ Padding เอง
          "w-[95vw] h-[95vh] max-w-none max-h-none",
          "lg:w-[80vw] lg:h-[90vh] lg:max-w-[1200px]"
        )}
      >
        {/* Header จะอยู่นิ่ง */}
        <DialogHeader className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            เพิ่มครุภัณฑ์ใหม่
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลครุภัณฑ์ที่ต้องการเพิ่มเข้าระบบ
          </DialogDescription>
        </DialogHeader>

        {/* ⭐️ นำ Flow หลักเข้ามาแสดงผลที่นี่ */}
        <div className="flex-1 overflow-y-auto">
          <AddAssetFlow
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
