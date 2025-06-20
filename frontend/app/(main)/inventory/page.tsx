"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { AddInventoryDialog } from "@/features/admin/components/inventory/add-inventory-dialog";
import { useInventory } from "@/features/admin/hooks/useInventory";
import { InventoryGrid } from "@/features/admin/components/inventory/inventory-grid";

export default function InventoryPage() {
  const { data: session } = useSession();

  // ⭐ เรียกใช้ Custom Hook ที่สมบูรณ์แล้ว
  const {
    items,
    loading,
    searchTerm,
    setSearchTerm,
    selectedDepartment,
    setSelectedDepartment,
    selectedCategory,
    setSelectedCategory,
    refreshItems,
  } = useInventory();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";

  // ⭐ เพิ่ม console.log ตรงนี้เพื่อดูข้อมูล
  useEffect(() => {
    if (!loading) {
      console.log("Data received from backend:", items);
    }
  }, [items, loading]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">คลังครุภัณฑ์</h1>
          <p className="text-gray-600">จัดการครุภัณฑ์ทั้งหมดในระบบ</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-ku-green hover:bg-ku-green-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มของเข้าคลัง
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาครุภัณฑ์..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* ต่อไปคุณสามารถดึงข้อมูล Department และ Category จริงมาใส่ใน Select ได้ */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ku-green"
            >
              <option value="">ทุกหน่วยงาน</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ku-green"
            >
              <option value="">ทุกหมวดหมู่</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <InventoryGrid items={items} isLoading={loading} isAdmin={!!isAdmin} />

      <AddInventoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={refreshItems}
      />
    </div>
  );
}
