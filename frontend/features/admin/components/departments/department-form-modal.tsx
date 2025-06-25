"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  DepartmentService,
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
} from "@/features/shared/services/department-service";

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department?: Department;
  mode: "create" | "edit";
}

export function DepartmentFormModal({
  isOpen,
  onClose,
  onSuccess,
  department,
  mode,
}: DepartmentFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    name_en: "",
    code: "",
    type: "DIVISION" as "FACULTY" | "DIVISION",
    parent_id: "",
    is_active: true,
  });

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const facultyList = await DepartmentService.getFaculties();
        setFaculties(facultyList);
      } catch (error) {
        console.error("Failed to load faculties:", error);
      }
    };

    if (isOpen) {
      loadFaculties();
      if (mode === "edit" && department) {
        setFormData({
          name: department.name || "",
          name_en: department.name_en || "",
          code: department.code || "",
          type: department.type || "DIVISION",
          parent_id: department.parent_id || "",
          is_active:
            typeof department.is_active === "boolean"
              ? department.is_active
              : true,
        });
      } else {
        setFormData({
          name: "",
          name_en: "",
          code: "",
          type: "DIVISION",
          parent_id: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, mode, department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน", {
        description: "ชื่อและรหัสหน่วยงานจำเป็นต้องกรอก",
      });
      return;
    }
    if (formData.type === "DIVISION" && !formData.parent_id) {
      toast.error("กรุณาเลือกคณะ", {
        description: "หน่วยงานประเภทภาควิชาต้องระบุคณะ",
      });
      return;
    }
    // Client-side duplicate check (optional, for UX)
    const codeExists = faculties.some((f) => f.code === formData.code.trim());
    if (mode === "create" && codeExists) {
      toast.error("รหัสหน่วยงานนี้ถูกใช้แล้ว", {
        description: "กรุณาใช้รหัสอื่น",
      });
      return;
    }
    try {
      setLoading(true);
      if (mode === "edit" && department) {
        const updateData: UpdateDepartmentData = {
          name: formData.name.trim(),
          name_en: formData.name_en?.trim() || "",
          code: formData.code.trim(),
          type: formData.type,
          parent_id:
            formData.type === "DIVISION" ? formData.parent_id : undefined,
          is_active: formData.is_active,
        };
        await DepartmentService.updateDepartment(department.id, updateData);
        toast.success("แก้ไขสำเร็จ", {
          description: "ข้อมูลหน่วยงานได้รับการอัปเดตแล้ว",
        });
      } else {
        const createData: CreateDepartmentData = {
          name: formData.name.trim(),
          name_en: formData.name_en?.trim() || "",
          code: formData.code.trim(),
          type: formData.type,
          parent_id:
            formData.type === "DIVISION" ? formData.parent_id : undefined,
        };
        await DepartmentService.createDepartment(createData);
        toast.success("เพิ่มสำเร็จ", {
          description: "หน่วยงานใหม่ได้รับการสร้างแล้ว",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      let msg = "เกิดข้อผิดพลาด";
      if (error instanceof Error && error.message.includes("duplicate")) {
        msg = "รหัสหรือชื่อหน่วยงานนี้ถูกใช้แล้ว";
      }
      toast.error(msg, {
        description:
          mode === "edit"
            ? "ไม่สามารถแก้ไขข้อมูลหน่วยงานได้"
            : "ไม่สามารถสร้างหน่วยงานได้",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "แก้ไขหน่วยงาน" : "เพิ่มหน่วยงานใหม่"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อหน่วยงาน (TH) *</Label>
              <Input
                id="name"
                value={formData.name ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="เช่น วิทยาศาสตร์คอมพิวเตอร์"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">ชื่อหน่วยงาน (EN)</Label>
              <Input
                id="name_en"
                value={formData.name_en ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, name_en: e.target.value })
                }
                placeholder="เช่น Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">รหัสหน่วยงาน *</Label>
              <Input
                id="code"
                value={formData.code ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="เช่น CS"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">ประเภท</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "FACULTY" | "DIVISION") =>
                setFormData({
                  ...formData,
                  type: value,
                  parent_id: value === "FACULTY" ? "" : formData.parent_id,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FACULTY">คณะ</SelectItem>
                <SelectItem value="DIVISION">ภาควิชา/หน่วยงาน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === "DIVISION" && (
            <div className="space-y-2">
              <Label htmlFor="parent_id">คณะ *</Label>
              <Select
                value={formData.parent_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกคณะ" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name} ({faculty.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "edit" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">เปิดใช้งาน</Label>
            </div>
          )}

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
              type="submit"
              disabled={loading}
              className="bg-ku-green hover:bg-ku-green-dark"
            >
              {loading
                ? "กำลังบันทึก..."
                : mode === "edit"
                ? "บันทึก"
                : "เพิ่ม"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
