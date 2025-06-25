"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  userService,
  UserProfile,
  UpdateUserProfileRequest,
} from "../../services/user-service";
import { departmentService, Faculty } from "../../services/department-service";

interface EditProfileModalProps {
  user: UserProfile;
  onProfileUpdate: (updatedUser: UserProfile) => void;
  trigger?: React.ReactNode;
  buttonClassName?: string;
}

export function EditProfileModal({
  user,
  onProfileUpdate,
  trigger,
}: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    faculty_id: "none",
    department_id:
      user.department_id != null ? user.department_id.toString() : "none", // Handle null/undefined properly
  });

  // Debug initial values
  console.log("=== INITIAL FORM DATA ===");
  console.log("User object:", user);
  console.log(
    "User department_id:",
    user.department_id,
    "Type:",
    typeof user.department_id
  );
  console.log("Is null/undefined?", user.department_id == null);
  console.log(
    "Initial form department_id:",
    user.department_id != null ? user.department_id.toString() : "none"
  );
  console.log("========================");

  // Load faculties
  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const data = await departmentService.getFaculties();
        setFaculties(data);

        // Find current faculty based on user's department
        if (user.department_id != null) {
          const currentFaculty = data.find((f) =>
            f.departments.some((d) => parseInt(d.id) === user.department_id)
          );
          if (currentFaculty) {
            setSelectedFaculty(currentFaculty);
            setFormData((prev) => ({ ...prev, faculty_id: currentFaculty.id }));
          }
        }
      } catch (error) {
        console.error("Failed to load faculties:", error);
      }
    };

    loadFaculties();
  }, [user.department_id]);

  // Update selected faculty when faculty_id changes
  useEffect(() => {
    if (formData.faculty_id && formData.faculty_id !== "none") {
      const faculty = faculties.find((f) => f.id === formData.faculty_id);
      setSelectedFaculty(faculty || null);
      // Reset department when faculty changes (except during initial load)
      if (faculty && faculty.id !== selectedFaculty?.id) {
        setFormData((prev) => ({ ...prev, department_id: "none" }));
      }
    } else {
      setSelectedFaculty(null);
    }
  }, [formData.faculty_id, faculties, selectedFaculty?.id]);

  // Reset form when user data changes
  useEffect(() => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      faculty_id: selectedFaculty?.id || "none",
      department_id:
        user.department_id != null ? user.department_id.toString() : "none",
    });
  }, [user, selectedFaculty?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("กรุณากรอกชื่อ");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare update data (only include changed fields)
      const updateData: UpdateUserProfileRequest = {};

      if (formData.name !== user.name) {
        updateData.name = formData.name.trim();
      }

      if (formData.phone !== user.phone) {
        updateData.phone = formData.phone.trim();
      }

      // Check for department changes - more explicit comparison
      const currentDeptId =
        user.department_id != null ? user.department_id.toString() : "none";
      const selectedDeptId = formData.department_id;

      console.log("=== DEPARTMENT COMPARISON ===");
      console.log(
        "Current dept ID:",
        user.department_id,
        "Type:",
        typeof user.department_id
      );
      console.log("Current as string:", currentDeptId);
      console.log(
        "Selected dept ID:",
        selectedDeptId,
        "Type:",
        typeof selectedDeptId
      );
      console.log("Are they different?", selectedDeptId !== currentDeptId);
      console.log("Form data department_id:", formData.department_id);
      console.log("Selected faculty:", selectedFaculty?.name);
      console.log(
        "Available departments:",
        selectedFaculty?.departments.map((d) => ({ id: d.id, name: d.name }))
      );

      if (selectedDeptId !== currentDeptId) {
        // Handle "none" value as null for API
        if (selectedDeptId === "none") {
          updateData.department_id = null;
          console.log("Setting department_id to null (clear)");
        } else {
          updateData.department_id = parseInt(selectedDeptId);
          console.log("Setting department_id to:", updateData.department_id);
        }
      }

      console.log("=== DEBUG DEPARTMENT UPDATE ===");
      console.log("Current user data:", user);
      console.log("Form data:", formData);
      console.log("User department_id type:", typeof user.department_id);
      console.log("Form department_id type:", typeof formData.department_id);
      console.log(
        "Comparison:",
        formData.department_id,
        "!==",
        user.department_id?.toString() || "none"
      );
      console.log("Update data to be sent:", updateData);
      console.log("===============================");

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.info("ไม่มีการเปลี่ยนแปลงข้อมูล");
        setIsOpen(false);
        return;
      }

      const updatedUser = await userService.updateProfile(updateData);
      console.log("Updated user received:", updatedUser);
      onProfileUpdate(updatedUser);
      toast.success("อัปเดตข้อมูลส่วนตัวสำเร็จ");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    const currentFaculty = faculties.find((f) =>
      f.departments.some((d) => parseInt(d.id) === user.department_id)
    );

    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      faculty_id: currentFaculty?.id || "none",
      department_id:
        user.department_id != null ? user.department_id.toString() : "none",
    });
    setSelectedFaculty(currentFaculty || null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-blue-50/80 hover:border-blue-200 transition-all duration-200 group"
          >
            <User className="w-5 h-5 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="flex-1 text-left">แก้ไขข้อมูลส่วนตัว</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-slate-700/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
            แก้ไขข้อมูลส่วนตัว
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              ชื่อ *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50"
              placeholder="กรอกชื่อของคุณ"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              เบอร์โทรศัพท์
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50"
              placeholder="02-123-4567 หรือ 09X-XXX-XXXX"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="faculty"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              คณะ
            </Label>
            <Select
              value={formData.faculty_id}
              onValueChange={(value) =>
                setFormData({ ...formData, faculty_id: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-gray-200/50 dark:border-slate-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400">
                <SelectValue placeholder="เลือกคณะ" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-slate-800/95 text-gray-900 dark:text-white border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-lg">
                <SelectItem
                  value="none"
                  className="dark:bg-slate-800/95 dark:text-white"
                >
                  ไม่ระบุ
                </SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem
                    key={faculty.id}
                    value={faculty.id}
                    className="dark:bg-slate-800/95 dark:text-white"
                  >
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="department"
              className="dark:bg-slate-800/95 dark:text-white"
            >
              ภาควิชา/หน่วยงาน
            </Label>
            <Select
              value={formData.department_id}
              onValueChange={(value) => {
                console.log(
                  "🏢 Department selected:",
                  value,
                  "Type:",
                  typeof value
                );
                setFormData({ ...formData, department_id: value });
              }}
              disabled={isLoading || !selectedFaculty}
            >
              <SelectTrigger className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-gray-200/50 dark:border-slate-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400">
                <SelectValue
                  placeholder={
                    selectedFaculty ? "เลือกภาควิชา/หน่วยงาน" : "เลือกคณะก่อน"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-slate-800/95 text-gray-900 dark:text-white border border-gray-200/50 dark:border-slate-700/50 backdrop-blur-lg">
                <SelectItem
                  value="none"
                  className="dark:bg-slate-800/95 dark:text-white"
                >
                  ไม่ระบุ
                </SelectItem>
                {selectedFaculty?.departments.map((dept) => (
                  <SelectItem
                    key={dept.id}
                    value={dept.id}
                    className="dark:bg-slate-800/95 dark:text-white"
                  >
                    <div className="flex flex-col items-start">
                      <span>{dept.name}</span>
                      {dept.building && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dept.building}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50/60 rounded-lg p-3 dark:bg-green-600/60 dark:text-white">
            <p className="font-medium mb-1">หมายเหตุ:</p>
            <p>• อีเมลไม่สามารถแก้ไขได้เนื่องจากใช้สำหรับเข้าสู่ระบบ</p>
            <p>• ข้อมูลที่แก้ไขจะมีผลทันทีหลังจากบันทึก</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-50/60 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50/80"
            >
              <X className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg dark:text-white"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
