"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductManagementService } from "../../services/product-management-service";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isConfirmValid = confirmText === product?.name;

  const handleDelete = async () => {
    if (!product || !isConfirmValid) return;

    try {
      setLoading(true);

      await ProductManagementService.deleteProduct(product.id);

      toast.success("ลบสินค้าสำเร็จ 🗑️", {
        description: `${product.name} ถูกลบออกจากระบบแล้ว`,
      });

      onSuccess?.();
      onOpenChange(false);
      setConfirmText("");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("ไม่สามารถลบสินค้าได้", {
        description:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmText("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            ยืนยันการลบสินค้า
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              คุณกำลังจะลบสินค้า <strong>{product?.name}</strong> ออกจากระบบ
            </p>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">⚠️ คำเตือน:</p>
              <ul className="text-red-700 text-sm mt-1 space-y-1">
                <li>• การลบนี้ไม่สามารถยกเลิกได้</li>
                <li>• ข้อมูลทั้งหมดจะถูกลบถาวร</li>
                <li>• หากมีการเบิกค้างอยู่อาจมีปัญหา</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-name" className="text-sm font-medium">
                พิมพ์ชื่อสินค้าเพื่อยืนยัน:
              </Label>
              <Input
                id="confirm-name"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={product?.name}
                className="font-mono"
              />
              {confirmText && !isConfirmValid && (
                <p className="text-red-600 text-xs">
                  ชื่อสินค้าไม่ตรงกัน กรุณาพิมพ์ &quot;{product?.name}&quot;
                  ให้ถูกต้อง
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmValid || loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4 mr-2" />
            )}
            ลบสินค้าถาวร
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
