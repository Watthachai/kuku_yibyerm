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
import { KULoading } from "@/components/ui/ku-loading";
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
    return <KULoading variant="table" message="กำลังโหลดรายการสินค้า..." />;
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ไม่พบสินค้าในระบบ
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
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
        color:
          "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-100 border border-red-200 dark:border-red-700",
        icon: AlertTriangle,
      };
    } else if (stock <= minStock) {
      return {
        label: "สต็อกต่ำ",
        color:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-700",
        icon: TrendingDown,
      };
    } else {
      return {
        label: "พร้อมใช้งาน",
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-100 border border-green-200 dark:border-green-700",
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
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-ku-green dark:group-hover:text-ku-green transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                      <span className="text-gray-600 dark:text-gray-400">
                        หมวดหมู่:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {product.category.name}
                      </span>
                    </div>
                  )}

                  {product.brand && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        ยี่ห้อ:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {product.brand}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      คงเหลือ:
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        product.stock === 0
                          ? "text-red-600 dark:text-red-400"
                          : product.stock <= (product.minStock || 0)
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                      )}
                    >
                      {product.stock} {product.unit || "ชิ้น"}
                    </span>
                  </div>

                  {product.minStock !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        ขั้นต่ำ:
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {product.minStock} {product.unit || "ชิ้น"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
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
                    className="flex-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
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
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">
              รหัส
            </TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">
              ชื่อสินค้า
            </TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">
              หมวดหมู่
            </TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">
              ยี่ห้อ
            </TableHead>
            <TableHead className="text-right text-gray-900 dark:text-gray-100 font-semibold">
              คงเหลือ
            </TableHead>
            <TableHead className="text-right text-gray-900 dark:text-gray-100 font-semibold">
              ขั้นต่ำ
            </TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">
              สถานะ
            </TableHead>
            <TableHead className="text-gray-900 dark:text-gray-100 font-semibold">
              วันที่อัปเดต
            </TableHead>
            <TableHead className="text-center text-gray-900 dark:text-gray-100 font-semibold">
              จัดการ
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const stockStatus = getStockStatus(
              product.stock,
              product.minStock || 0
            );

            return (
              <TableRow
                key={product.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <TableCell className="font-mono text-sm text-gray-900 dark:text-gray-100">
                  {product.code || `PRD${product.id}`}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    {product.productModel && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        รุ่น: {product.productModel}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-gray-200">
                  {product.category?.name || "ไม่ระบุ"}
                </TableCell>
                <TableCell className="text-gray-900 dark:text-gray-200">
                  {product.brand || "ไม่ระบุ"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={cn(
                        "font-bold",
                        product.stock === 0
                          ? "text-red-600 dark:text-red-400"
                          : product.stock <= (product.minStock || 0)
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
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
                <TableCell className="text-right text-gray-900 dark:text-gray-200">
                  {product.minStock || 0} {product.unit || "ชิ้น"}
                </TableCell>
                <TableCell>
                  <Badge className={stockStatus.color}>
                    {stockStatus.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
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
