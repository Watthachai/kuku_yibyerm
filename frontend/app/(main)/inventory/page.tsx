"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Package } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface Item {
  id: number;
  name: string;
  serialNumber: string;
  description?: string;
  imageUrl?: string;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "DAMAGED";
  quantity: number;
  category: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
}

export default function InventoryPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";
  const isApprover = session?.user?.role === "APPROVER";

  // Mock data - ในการใช้งานจริงจะต้อง fetch จาก API
  useEffect(() => {
    const mockItems: Item[] = [
      {
        id: 1,
        name: "เครื่องฉายภาพ Epson EB-X41",
        serialNumber: "EP001-2024",
        description: "เครื่องฉายภาพ 3LCD สำหรับห้องเรียน",
        status: "AVAILABLE",
        quantity: 3,
        category: { id: 1, name: "อุปกรณ์โสตทัศนูปกรณ์" },
        department: { id: 1, name: "คณะเกษตร" },
      },
      {
        id: 2,
        name: "เครื่องพิมพ์ HP LaserJet Pro",
        serialNumber: "HP002-2024",
        description: "เครื่องพิมพ์เลเซอร์ขาวดำ",
        status: "IN_USE",
        quantity: 1,
        category: { id: 2, name: "อุปกรณ์สำนักงาน" },
        department: { id: 2, name: "คณะวิศวกรรมศาสตร์" },
      },
    ];

    setTimeout(() => {
      setItems(mockItems);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "IN_USE":
        return "bg-blue-100 text-blue-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "DAMAGED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "พร้อมใช้งาน";
      case "IN_USE":
        return "กำลังใช้งาน";
      case "MAINTENANCE":
        return "ซ่อมบำรุง";
      case "DAMAGED":
        return "ชำรุด";
      default:
        return status;
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "" || item.department.name === selectedDepartment;
    const matchesCategory =
      selectedCategory === "" || item.category.name === selectedCategory;

    return matchesSearch && matchesDepartment && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">คลังครุภัณฑ์</h1>
          <p className="text-gray-600">จัดการและค้นหาครุภัณฑ์ของมหาวิทยาลัย</p>
        </div>
        {isAdmin && (
          <Button className="bg-ku-green hover:bg-ku-green-dark">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มครุภัณฑ์
          </Button>
        )}
      </div>

      {/* Filters */}
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

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ku-green"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">ทุกหน่วยงาน</option>
              <option value="คณะเกษตร">คณะเกษตร</option>
              <option value="คณะวิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ku-green"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">ทุกหมวดหมู่</option>
              <option value="อุปกรณ์โสตทัศนูปกรณ์">อุปกรณ์โสตทัศนูปกรณ์</option>
              <option value="อุปกรณ์สำนักงาน">อุปกรณ์สำนักงาน</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ku-green"></div>
          <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-full h-48 mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <p className="text-sm text-gray-600">{item.serialNumber}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusText(item.status)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      คงเหลือ: {item.quantity}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>หมวดหมู่: {item.category.name}</p>
                    <p>หน่วยงาน: {item.department.name}</p>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="pt-3 space-y-2">
                    {!isAdmin &&
                      item.status === "AVAILABLE" &&
                      item.quantity > 0 && (
                        <Button
                          className="w-full bg-ku-green hover:bg-ku-green-dark"
                          size="sm"
                        >
                          ทำเรื่องเบิก
                        </Button>
                      )}

                    {(isAdmin || isApprover) && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          แก้ไข
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            ลบ
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ไม่พบครุภัณฑ์
          </h3>
          <p className="text-gray-600">
            ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูล
          </p>
        </div>
      )}
    </div>
  );
}
