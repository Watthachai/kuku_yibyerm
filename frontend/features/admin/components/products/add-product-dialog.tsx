"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddProductForm } from "./add-product-form";

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
    onOpenChange(false); // ปิด Dialog
    onSuccess(); // สั่งให้หน้าหลัก Refresh
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มสินค้า/วัสดุสิ้นเปลืองใหม่</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลสินค้าและจำนวนเริ่มต้นเพื่อเพิ่มเข้าสู่คลัง
          </DialogDescription>
        </DialogHeader>
        <AddProductForm
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
