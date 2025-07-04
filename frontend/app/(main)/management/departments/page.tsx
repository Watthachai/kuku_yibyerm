"use client";

import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/guards/admin-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DepartmentService,
  Department,
} from "@/features/shared/services/department-service";
import { DepartmentFormModal } from "@/features/admin/components/departments/department-form-modal";
import { DeleteDepartmentModal } from "@/features/admin/components/departments/delete-department-modal";

export default function DepartmentsManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedDepartment, setSelectedDepartment] = useState<
    Department | undefined
  >();

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await DepartmentService.getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments:", error);
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถโหลดข้อมูลหน่วยงานได้",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleAddDepartment = () => {
    setModalMode("create");
    setSelectedDepartment(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setModalMode("edit");
    setSelectedDepartment(department);
    setIsFormModalOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadDepartments(); // Reload data after successful operation
  };

  const filteredDepartments = departments.filter((dept) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch =
      dept.name_th?.toLowerCase().includes(searchLower) || false;
    const codeMatch = dept.code?.toLowerCase().includes(searchLower) || false;
    const facultyMatch =
      dept.facultyName?.toLowerCase().includes(searchLower) || false;
    return nameMatch || codeMatch || facultyMatch;
  });

  const getDepartmentTypeBadge = (type: "FACULTY" | "DIVISION") => {
    if (type === "FACULTY") {
      return <Badge variant="secondary">คณะ</Badge>;
    }
    return <Badge variant="outline">ภาควิชา</Badge>;
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="space-y-6">
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการหน่วยงาน</h1>
            <p className="text-gray-600">
              จัดการข้อมูลหน่วยงานและภาควิชาต่างๆ ในมหาวิทยาลัย
            </p>
          </div>
          <Button
            onClick={handleAddDepartment}
            className="bg-ku-green hover:bg-ku-green-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มหน่วยงาน
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>รายการหน่วยงาน</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาหน่วยงาน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อหน่วยงาน</TableHead>
                  <TableHead>รหัส</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>คณะ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-ku-green rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">
                          {department.name_th}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{department.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {getDepartmentTypeBadge(department.type)}
                    </TableCell>
                    <TableCell>
                      {department.type === "DIVISION"
                        ? department.facultyName || "ไม่ระบุคณะ"
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          department.is_active ? "default" : "destructive"
                        }
                      >
                        {department.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(department.created_at).toLocaleDateString(
                        "th-TH"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditDepartment(department)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteDepartment(department)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredDepartments.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ไม่พบหน่วยงาน
                </h3>
                <p className="text-gray-600">
                  ลองเปลี่ยนคำค้นหาหรือเพิ่มหน่วยงานใหม่
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <DepartmentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleModalSuccess}
        department={selectedDepartment}
        mode={modalMode}
      />

      <DeleteDepartmentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleModalSuccess}
        department={selectedDepartment}
      />
    </AdminGuard>
  );
}
