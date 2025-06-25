"use client";

import { useState, useEffect } from "react";
import { UserManagementData } from "@/types/admin-dashboard";
import { AdminDashboardService } from "../services/admin-dashboard-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function AdminUserManagement() {
  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // ⭐ เพิ่ม useEffect เพื่อโหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    console.log("🔍 AdminUserManagement mounted, loading users...");
    loadUsers();
  }, [page]); // เมื่อ page เปลี่ยนให้โหลดใหม่

  const loadUsers = async () => {
    try {
      console.log("📋 Loading users...", { page, limit });
      setLoading(true);
      setError(null);

      const result = await AdminDashboardService.getUsersForManagement(page, limit);
      console.log("✅ Users loaded:", result);

      setUsers(result.users);
      setTotal(result.total);

      toast({
        title: "โหลดข้อมูลสำเร็จ",
        description: `พบผู้ใช้ทั้งหมด ${result.total} คน`,
      });

    } catch (error) {
      console.error("❌ Failed to load users:", error);
      setError(error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      console.log("🔄 Updating user status:", { userId, newStatus });
      
      await AdminDashboardService.updateUserStatus(userId, newStatus);
      await loadUsers(); // โหลดข้อมูลใหม่
      
      toast({
        title: "อัปเดตสำเร็จ",
        description: `เปลี่ยนสถานะผู้ใช้เป็น ${newStatus} แล้ว`,
      });
    } catch (error) {
      console.error("❌ Failed to update user status:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะผู้ใช้ได้",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "USER" | "APPROVER" | "ADMIN"
  ) => {
    try {
      console.log("🔄 Updating user role:", { userId, newRole });
      
      await AdminDashboardService.updateUserRole(userId, newRole);
      await loadUsers(); // โหลดข้อมูลใหม่
      
      toast({
        title: "อัปเดตสำเร็จ",
        description: `เปลี่ยนบทบาทผู้ใช้เป็น ${newRole} แล้ว`,
      });
    } catch (error) {
      console.error("❌ Failed to update user role:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตบทบาทผู้ใช้ได้",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  // ⭐ Loading State
  if (loading) {
    return <UserManagementSkeleton />;
  }

  // ⭐ Error State
  if (error && users.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadUsers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่อีกครั้ง
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>จัดการผู้ใช้</CardTitle>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาผู้ใช้..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            {/* Refresh Button */}
            <Button onClick={loadUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>หน่วยงาน</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>คำขอ</TableHead>
                <TableHead>เข้าสู่ระบบล่าสุด</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm ? "ไม่พบผู้ใช้ที่ค้นหา" : "ไม่มีข้อมูลผู้ใช้"}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "ADMIN"
                            ? "default"
                            : user.role === "APPROVER"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "ACTIVE" ? "default" : "destructive"
                        }
                      >
                        {user.status === "ACTIVE" ? "ใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.requestCount} รายการ</TableCell>
                    <TableCell>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString("th-TH")
                        : "ยังไม่เคย"}
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
                            onClick={() =>
                              handleStatusToggle(user.id, user.status)
                            }
                          >
                            {user.status === "ACTIVE" ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                ปิดใช้งาน
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                เปิดใช้งาน
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "USER")}
                            disabled={user.role === "USER"}
                          >
                            <User className="h-4 w-4 mr-2" />
                            ตั้งเป็น USER
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "APPROVER")}
                            disabled={user.role === "APPROVER"}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            ตั้งเป็น APPROVER
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "ADMIN")}
                            disabled={user.role === "ADMIN"}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            ตั้งเป็น ADMIN
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                แสดง {(page - 1) * limit + 1} ถึง {Math.min(page * limit, total)}{" "}
                จาก {total} รายการ
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  ก่อนหน้า
                </Button>
                <span className="text-sm">
                  หน้า {page} จาก {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  ถัดไป
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <p>Debug: Users loaded: {users.length}, Total: {total}, Page: {page}</p>
            {error && <p className="text-red-600">Error: {error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserManagementSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="mt-4 text-center text-gray-500">
          กำลังโหลดข้อมูลผู้ใช้...
        </div>
      </CardContent>
    </Card>
  );
}