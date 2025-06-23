"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Package,
  TrendingDown,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { ProductService } from "@/features/admin/services/product-service";
import { toast } from "sonner";
import { UserCatalogShoppingView } from "@/features/mobile/components/catalog/user-catalog-shopping-view";
import { AdminGuard } from "@/components/guards/admin-guard";
import { AddProductDialog } from "@/features/admin/components/products/add-product-dialog";
import { ProductList } from "@/features/admin/components/products/product-list";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // ⭐ ถ้าเป็น User ทั่วไป ให้แสดงหน้า Shopping
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserCatalogShoppingView />
      </div>
    );
  }

  // ⭐ ถ้าเป็น Admin ให้แสดงหน้าจัดการ
  return (
    <AdminGuard>
      <ProductManagementView />
    </AdminGuard>
  );
}

// ⭐ Component สำหรับ Admin จัดการ Products
function ProductManagementView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [view, setView] = useState<"table" | "cards">("cards");

  // Statistics
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= (p.minStock || 0)
  ).length;
  const inStock = products.filter((p) => p.stock > (p.minStock || 0)).length;

  // โหลดข้อมูล Product จาก Backend
  useEffect(() => {
    loadProducts();
  }, [searchTerm, statusFilter, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getProducts({
        search: searchTerm || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        category_id:
          categoryFilter !== "ALL" ? Number(categoryFilter) : undefined,
      });

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Failed to load products:", error);
      toast.error("เกิดข้อผิดพลาด: ไม่สามารถโหลดข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "IN_STOCK" &&
        product.stock > (product.minStock || 0)) ||
      (statusFilter === "LOW_STOCK" &&
        product.stock > 0 &&
        product.stock <= (product.minStock || 0)) ||
      (statusFilter === "OUT_OF_STOCK" && product.stock === 0);

    return matchesSearch && matchesStatus;
  });

  const handleProductAdded = () => {
    setIsAddDialogOpen(false);
    loadProducts();
    toast.success("เพิ่มสินค้าสำเร็จ 🎉", {
      description: "สินค้าใหม่ถูกเพิ่มเข้าระบบเรียบร้อยแล้ว",
    });
  };

  const handleEditProduct = (product: Product) => {
    // TODO: Implement edit functionality
    toast.info("กำลังพัฒนาฟีเจอร์นี้", {
      description: "ฟีเจอร์แก้ไขสินค้าจะพร้อมใช้งานเร็วๆ นี้",
    });
  };

  const handleDeleteProduct = async (product: Product) => {
    // TODO: Implement delete functionality with confirmation
    toast.info("กำลังพัฒนาฟีเจอร์นี้", {
      description: "ฟีเจอร์ลบสินค้าจะพร้อมใช้งานเร็วๆ นี้",
    });
  };

  const handleViewDetails = (product: Product) => {
    // TODO: Implement product details view
    toast.info("กำลังพัฒนาฟีเจอร์นี้", {
      description: "ฟีเจอร์ดูรายละเอียดสินค้าจะพร้อมใช้งานเร็วๆ นี้",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการสินค้า</h1>
          <p className="text-gray-600 mt-1">
            เพิ่ม แก้ไข และจัดการสินค้าในระบบ
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-ku-green hover:bg-ku-green-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มสินค้าใหม่
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">สินค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProducts}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">พร้อมใช้งาน</p>
                <p className="text-2xl font-bold text-green-600">{inStock}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">สต็อกต่ำ</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStock}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">หมดสต็อก</p>
                <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาชื่อสินค้า, รหัส, ยี่ห้อ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="สถานะสต็อก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ทั้งหมด</SelectItem>
                <SelectItem value="IN_STOCK">พร้อมใช้งาน</SelectItem>
                <SelectItem value="LOW_STOCK">สต็อกต่ำ</SelectItem>
                <SelectItem value="OUT_OF_STOCK">หมดสต็อก</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={view === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("cards")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("table")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(statusFilter !== "ALL" || searchTerm) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">กรองโดย:</span>
              {statusFilter !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  สถานะ: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  ค้นหา: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product List */}
      <ProductList
        products={filteredProducts}
        loading={loading}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onViewDetails={handleViewDetails}
      />

      {/* Add Product Dialog */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleProductAdded}
      />
    </div>
  );
}
