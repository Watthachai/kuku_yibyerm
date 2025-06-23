"use client";

import { Product } from "@/types/product";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Package,
  TrendingDown,
  Eye,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  view?: "table" | "cards"; // ⭐ เพิ่ม view prop
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  onUpdateStock?: (product: Product) => void;
}

export function ProductList({
  products,
  loading,
  view = "cards", // ⭐ รับ view จาก parent
  onEdit,
  onDelete,
  onViewDetails,
  onUpdateStock, // ⭐ ใช้ function นี้
}: ProductListProps) {
  // ⭐ ลบ internal view state
  // const [view, setView] = useState<"table" | "cards">("cards");

  // ⭐ เพิ่ม Quick Stock Update
  const handleQuickStockUpdate = (product: Product, newStock: number) => {
    const updatedProduct = { ...product, stock: newStock };
    onUpdateStock?.(updatedProduct);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ไม่พบสินค้าในระบบ
          </h3>
          <p className="text-gray-600">
            เริ่มต้นด้วยการเพิ่มสินค้าใหม่เข้าสู่ระบบ
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) {
      return {
        label: "หมดสต็อก",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
      };
    } else if (stock <= minStock) {
      return {
        label: "สต็อกต่ำ",
        color: "bg-yellow-100 text-yellow-800",
        icon: TrendingDown,
      };
    } else {
      return {
        label: "พร้อมใช้งาน",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Cards View
  if (view === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const stockStatus = getStockStatus(
            product.stock,
            product.minStock || 0
          );
          const StatusIcon = stockStatus.icon;

          return (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-ku-green transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      รหัส: {product.code || `PRD${product.id}`}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "ml-2 flex items-center gap-1",
                      stockStatus.color
                    )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {stockStatus.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Product Info */}
                <div className="space-y-2 text-sm">
                  {product.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">หมวดหมู่:</span>
                      <span className="font-medium">
                        {product.category.name}
                      </span>
                    </div>
                  )}

                  {product.brand && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ยี่ห้อ:</span>
                      <span className="font-medium">{product.brand}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">คงเหลือ:</span>
                    <span
                      className={cn(
                        "font-bold",
                        product.stock === 0
                          ? "text-red-600"
                          : product.stock <= (product.minStock || 0)
                          ? "text-yellow-600"
                          : "text-green-600"
                      )}
                    >
                      {product.stock} {product.unit || "ชิ้น"}
                    </span>
                  </div>

                  {product.minStock !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ขั้นต่ำ:</span>
                      <span className="text-gray-500">
                        {product.minStock} {product.unit || "ชิ้น"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* ⭐ Quick Stock Actions - แสดงเมื่อสต็อกต่ำ */}
                {product.stock <= (product.minStock || 0) && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 mb-2">
                      เติมสต็อกด่วน:
                    </p>
                    <div className="flex gap-1">
                      {[10, 20, 50].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1 h-6"
                          onClick={() =>
                            handleQuickStockUpdate(
                              product,
                              product.stock + amount
                            )
                          }
                        >
                          +{amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onViewDetails?.(product)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    ดู
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onEdit?.(product)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs hover:bg-red-50 hover:text-red-600"
                    onClick={() => onDelete?.(product)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    ลบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // ⭐ Table View ก็เพิ่ม Quick Stock Update
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัส</TableHead>
            <TableHead>ชื่อสินค้า</TableHead>
            <TableHead>หมวดหมู่</TableHead>
            <TableHead>ยี่ห้อ</TableHead>
            <TableHead className="text-right">คงเหลือ</TableHead>
            <TableHead className="text-right">ขั้นต่ำ</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>วันที่อัปเดต</TableHead>
            <TableHead className="text-center">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const stockStatus = getStockStatus(
              product.stock,
              product.minStock || 0
            );

            return (
              <TableRow key={product.id} className="hover:bg-gray-50">
                <TableCell className="font-mono text-sm">
                  {product.code || `PRD${product.id}`}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    {product.productModel && (
                      <p className="text-sm text-gray-500">
                        รุ่น: {product.productModel}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.category?.name || "ไม่ระบุ"}</TableCell>
                <TableCell>{product.brand || "ไม่ระบุ"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={cn(
                        "font-bold",
                        product.stock === 0
                          ? "text-red-600"
                          : product.stock <= (product.minStock || 0)
                          ? "text-yellow-600"
                          : "text-green-600"
                      )}
                    >
                      {product.stock} {product.unit || "ชิ้น"}
                    </span>
                    {/* ⭐ Quick Add Stock Button */}
                    {product.stock <= (product.minStock || 0) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 h-6 w-6 p-0"
                        onClick={() =>
                          handleQuickStockUpdate(product, product.stock + 10)
                        }
                        title="เติมสต็อก +10"
                      >
                        +
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {product.minStock || 0} {product.unit || "ชิ้น"}
                </TableCell>
                <TableCell>
                  <Badge className={stockStatus.color}>
                    {stockStatus.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(product.updatedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails?.(product)}
                      title="ดูรายละเอียด"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(product)}
                      title="แก้ไข"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(product)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
