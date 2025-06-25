"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  DepartmentService,
  Department,
} from "@/features/shared/services/department-service";

interface DeleteDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department?: Department;
}

export function DeleteDepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  department,
}: DeleteDepartmentModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!department) return;

    try {
      setLoading(true);
      await DepartmentService.deleteDepartment(department.id);

      toast.success("ลบสำเร็จ", {
        description: `หน่วยงาน "${department.name}" ได้รับการลบแล้ว`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to delete department:", error);
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถลบหน่วยงานได้ อาจมีข้อมูลที่เกี่ยวข้องอยู่",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <DialogTitle>ยืนยันการลบ</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            คุณแน่ใจหรือไม่ที่จะลบหน่วยงาน{" "}
            <span className="font-semibold">
              &ldquo;{department?.name}&rdquo;
            </span>
            ?
            <br />
            <br />
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
            และอาจส่งผลต่อข้อมูลที่เกี่ยวข้อง
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "กำลังลบ..." : "ลบ"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
