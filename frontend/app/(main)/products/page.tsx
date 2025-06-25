"use client";

import { useState, useEffect, useCallback } from "react";
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
  Download,
  RefreshCw,
} from "lucide-react";
import { ProductManagementService } from "@/features/admin/services/product-management-service";
import { toast } from "sonner";
import { UserCatalogShoppingView } from "@/features/mobile/components/catalog/user-catalog-shopping-view";
import { AdminGuard } from "@/components/guards/admin-guard";
import { AddProductDialog } from "@/features/admin/components/products/add-product-dialog";
import { EditProductDialog } from "@/features/admin/components/products/edit-product-dialog";
import { DeleteProductDialog } from "@/features/admin/components/products/delete-product-dialog";
import { ProductDetailDialog } from "@/features/admin/components/products/product-detail-dialog";
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
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
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"
  >("ALL");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [view, setView] = useState<"table" | "cards">("cards");

  // Dialog states
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  // Statistics
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= (p.minStock || 0)
  ).length;
  const inStock = products.filter((p) => p.stock > (p.minStock || 0)).length;

  // ⭐ โหลดข้อมูล Product จาก Backend
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Map UI status filter to backend status
      let backendStatus: "ALL" | "ACTIVE" | "INACTIVE" | undefined;
      if (statusFilter === "ALL") {
        backendStatus = "ALL";
      } else if (statusFilter === "IN_STOCK" || statusFilter === "LOW_STOCK") {
        backendStatus = "ACTIVE";
      } else if (statusFilter === "OUT_OF_STOCK") {
        backendStatus = "INACTIVE";
      }

      const response = await ProductManagementService.getProducts({
        search: searchTerm || undefined,
        status: backendStatus !== "ALL" ? backendStatus : undefined,
      });

      setProducts(response.products);
    } catch (error) {
      console.error("❌ Failed to load products:", error);
      toast.error("เกิดข้อผิดพลาด: ไม่สามารถโหลดข้อมูลสินค้าได้");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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

  // ⭐ Event Handlers
  const handleProductAdded = () => {
    setIsAddDialogOpen(false);
    loadProducts();
    toast.success("เพิ่มสินค้าสำเร็จ 🎉", {
      description: "สินค้าใหม่ถูกเพิ่มเข้าระบบเรียบร้อยแล้ว",
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditProduct(product);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeleteProduct(product);
  };

  const handleViewDetails = (product: Product) => {
    setDetailProductId(product.id);
  };

  const handleExportProducts = async () => {
    try {
      toast.info("กำลังสร้างไฟล์...", { description: "กรุณารอสักครู่" });

      const blob = await ProductManagementService.exportProducts("csv");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("ส่งออกข้อมูลสำเร็จ 📄");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("ไม่สามารถส่งออกข้อมูลได้");
    }
  };

  // ⭐ เพิ่ม handler สำหรับ stock update
  const handleStockUpdate = async (product: Product) => {
    try {
      await ProductManagementService.updateProduct(product.id, {
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: parseInt(product.category?.id || "0"),
        brand: product.brand,
        productModel: product.productModel,
        stock: product.stock,
        minStock: product.minStock,
        unit: product.unit,
      });

      toast.success("อัปเดตสต็อกสำเร็จ", {
        description: `${product.name} สต็อกปัจจุบัน: ${product.stock} ${product.unit}`,
      });

      loadProducts(); // Refresh data
    } catch (error) {
      console.error("Failed to update stock:", error);
      toast.error("ไม่สามารถอัปเดตสต็อกได้");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            จัดการสินค้า
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            เพิ่ม แก้ไข และจัดการสินค้าในระบบ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadProducts} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            รีเฟรช
          </Button>
          <Button variant="outline" onClick={handleExportProducts}>
            <Download className="w-4 h-4 mr-2" />
            ส่งออก
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-ku-green hover:bg-ku-green-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มสินค้าใหม่
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  สินค้าทั้งหมด
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  พร้อมใช้งาน
                </p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  สต็อกต่ำ
                </p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  หมดสต็อก
                </p>
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
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            ค้นหาและกรอง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                placeholder="ค้นหาชื่อสินค้า, รหัส, ยี่ห้อ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(
                  value as "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"
                )
              }
            >
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
              <span className="text-sm text-gray-600 dark:text-gray-400">
                กรองโดย:
              </span>
              {statusFilter !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  สถานะ: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full"
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
                    className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full"
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
        view={view}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onViewDetails={handleViewDetails}
        onUpdateStock={handleStockUpdate} // ⭐ ส่ง stock update handler
      />

      {/* Dialogs */}
      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleProductAdded}
      />

      <EditProductDialog
        product={editProduct}
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        onSuccess={() => {
          setEditProduct(null);
          loadProducts();
        }}
      />

      <DeleteProductDialog
        product={deleteProduct}
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
        onSuccess={() => {
          setDeleteProduct(null);
          loadProducts();
        }}
      />

      <ProductDetailDialog
        productId={detailProductId}
        open={!!detailProductId}
        onOpenChange={(open) => !open && setDetailProductId(null)}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
}
