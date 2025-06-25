"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus } from "lucide-react";
import Image from "next/image";
import { Product } from "../../types/catalog.types";
import { KULoading } from "@/components/ui/ku-loading";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({
  products,
  loading,
  onProductClick,
  onAddToCart,
}: ProductGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "IN_USE":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
      case "MAINTENANCE":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
      case "DAMAGED":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200";
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

  if (loading) {
    return <KULoading variant="cards" />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          ไม่พบครุภัณฑ์
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          ลองเปลี่ยนเงื่อนไขการค้นหา
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <div
            className="cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            <div className="h-32 bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <Package className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ไม่มีรูปภาพ
                  </span>
                </div>
              )}
            </div>

            <div className="p-3">
              <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                {product.name}
              </h3>
              {product.serialNumber && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {product.serialNumber}
                </p>
              )}

              <div className="flex items-center justify-between mb-2">
                <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                  {getStatusText(product.status)}
                </Badge>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  คงเหลือ: {product.availableQuantity}
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                <p>{product.category.name}</p>
                <p>{product.department.name}</p>
              </div>
            </div>
          </div>

          <div className="px-3 pb-3">
            {product.status === "AVAILABLE" && product.availableQuantity > 0 ? (
              <Button
                size="sm"
                className="w-full bg-ku-green hover:bg-ku-green-dark text-xs"
                onClick={() => onAddToCart(product)}
              >
                <Plus className="w-3 h-3 mr-1" />
                เพิ่มในตะกร้า
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                disabled
              >
                ไม่พร้อมใช้งาน
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
