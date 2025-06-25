"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Calendar,
  Tag,
  BarChart3,
  AlertTriangle,
  Edit,
  Trash2,
  Download,
  History,
  TrendingUp,
} from "lucide-react";
import { Product } from "@/types/product";
import { ProductManagementService } from "../../services/product-management-service";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductDetailDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductDetailDialog({
  productId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ProductDetailDialogProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && productId) {
      loadProductDetails();
    } else {
      setProduct(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productId]);

  const loadProductDetails = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const data = await ProductManagementService.getProduct(productId);
      setProduct(data);
    } catch (error) {
      console.error("Failed to load product details:", error);
      toast.error("ไม่สามารถโหลดรายละเอียดสินค้าได้");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) {
      return {
        status: "OUT_OF_STOCK",
        label: "หมดสต็อก",
        color: "bg-red-100 text-red-800",
      };
    } else if (stock <= minStock) {
      return {
        status: "LOW_STOCK",
        label: "สต็อกต่ำ",
        color: "bg-yellow-100 text-yellow-800",
      };
    } else {
      return {
        status: "IN_STOCK",
        label: "พร้อมใช้งาน",
        color: "bg-green-100 text-green-800",
      };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExportProduct = async () => {
    if (!product) return;

    try {
      toast.info("กำลังสร้างไฟล์...", { description: "กรุณารอสักครู่" });

      // Create CSV content for single product
      const csvContent = [
        "ID,รหัสสินค้า,ชื่อสินค้า,ยี่ห้อ,รุ่น,หมวดหมู่,สต็อก,สต็อกขั้นต่ำ,หน่วย,สถานะ,วันที่สร้าง",
        `${product.id},"${product.code}","${product.name}","${
          product.brand
        }","${product.productModel}","${product.category?.name || ""}",${
          product.stock
        },${product.minStock},"${product.unit}","${
          product.status
        }","${formatDate(product.createdAt)}"`,
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `product-${product.code || product.id}-${Date.now()}.csv`;
      link.click();

      toast.success("ส่งออกข้อมูลสำเร็จ 📄");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("ไม่สามารถส่งออกข้อมูลได้");
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Skeleton className="h-6 w-48" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!product) return null;

  const stockStatus = getStockStatus(product.stock, product.minStock);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              รายละเอียดสินค้า
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportProduct}>
                <Download className="w-4 h-4 mr-2" />
                ส่งออก
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไข
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(product)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  ลบ
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                ข้อมูลพื้นฐาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    ชื่อสินค้า
                  </label>
                  <p className="text-lg font-semibold">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    รหัสสินค้า
                  </label>
                  <p className="font-mono">{product.code || "ไม่มี"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    ยี่ห้อ
                  </label>
                  <p>{product.brand || "ไม่ระบุ"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    รุ่น
                  </label>
                  <p>{product.productModel || "ไม่ระบุ"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    หมวดหมู่
                  </label>
                  <p>{product.category?.name || "ไม่ระบุ"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    หน่วยนับ
                  </label>
                  <p>{product.unit}</p>
                </div>
              </div>

              {product.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    คำอธิบาย
                  </label>
                  <p className="text-gray-700 mt-1">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                ข้อมูลสต็อก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {product.stock}
                  </div>
                  <div className="text-sm text-blue-800">จำนวนปัจจุบัน</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {product.minStock}
                  </div>
                  <div className="text-sm text-orange-800">สต็อกขั้นต่ำ</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Badge className={stockStatus.color}>
                    {stockStatus.label}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-2">สถานะ</div>
                </div>
              </div>

              {stockStatus.status === "LOW_STOCK" && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-yellow-800 font-medium">
                      แจ้งเตือนสต็อกต่ำ
                    </span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    สินค้าชิ้นนี้มีจำนวนคงเหลือต่ำกว่าที่กำหนด กรุณาเติมสต็อก
                  </p>
                </div>
              )}

              {stockStatus.status === "OUT_OF_STOCK" && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">
                      สินค้าหมดสต็อก
                    </span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    สินค้าชิ้นนี้หมดสต็อกแล้ว ไม่สามารถให้เบิกได้
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                ข้อมูลเวลา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    วันที่สร้าง
                  </label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(product.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    อัปเดตล่าสุด
                  </label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(product.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                การดำเนินการด่วน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button variant="outline" className="w-full" disabled>
                  <History className="w-4 h-4 mr-2" />
                  ประวัติการเบิก
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  รายงานการใช้งาน
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportProduct}
                >
                  <Download className="w-4 h-4 mr-2" />
                  ส่งออกข้อมูล
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                * ฟีเจอร์บางส่วนอยู่ระหว่างการพัฒนา
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
