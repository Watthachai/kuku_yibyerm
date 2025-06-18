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
  Users,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Department {
  id: string;
  name: string;
  faculty: string;
  userCount: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export default function DepartmentsManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      // TODO: Call API to get departments
      // const data = await DepartmentService.getDepartments();

      // Mock data for now
      const mockDepartments: Department[] = [
        {
          id: "1",
          name: "ภาควิชาพืชสวน",
          faculty: "คณะเกษตร",
          userCount: 25,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
          faculty: "คณะวิศวกรรมศาสตร์",
          userCount: 45,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "ภาควิชาการสอน",
          faculty: "คณะศึกษาศาสตร์",
          userCount: 18,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        },
      ];

      setDepartments(mockDepartments);
    } catch (error) {
      console.error("Failed to load departments:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลหน่วยงานได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = () => {
    // TODO: Implement add department modal
    console.log("Add department");
    toast({
      title: "กำลังพัฒนา",
      description: "ฟีเจอร์นี้จะเพิ่มในเร็วๆ นี้",
    });
  };

  const handleEditDepartment = (id: string) => {
    // TODO: Implement edit department modal
    console.log("Edit department:", id);
    toast({
      title: "กำลังพัฒนา",
      description: "ฟีเจอร์นี้จะเพิ่มในเร็วๆ นี้",
    });
  };

  const handleDeleteDepartment = (id: string) => {
    // TODO: Implement delete confirmation
    console.log("Delete department:", id);
    toast({
      title: "กำลังพัฒนา",
      description: "ฟีเจอร์นี้จะเพิ่มในเร็วๆ นี้",
    });
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.faculty.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <TableHead>คณะ</TableHead>
                  <TableHead>จำนวนผู้ใช้</TableHead>
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
                        <span className="font-medium">{department.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{department.faculty}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{department.userCount} คน</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          department.status === "ACTIVE"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {department.status === "ACTIVE"
                          ? "ใช้งาน"
                          : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(department.createdAt).toLocaleDateString(
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
                            onClick={() => handleEditDepartment(department.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteDepartment(department.id)
                            }
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
    </AdminGuard>
  );
}
