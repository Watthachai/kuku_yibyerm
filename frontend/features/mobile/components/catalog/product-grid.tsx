"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus } from "lucide-react";
import Image from "next/image";
import { Product } from "../../types/catalog.types";

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

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ไม่พบครุภัณฑ์
        </h3>
        <p className="text-gray-600">ลองเปลี่ยนเงื่อนไขการค้นหา</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div
            className="cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            <div className="h-32 bg-gray-100 flex items-center justify-center">
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
                  <span className="text-3xl mb-1">{product.category.icon}</span>
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            <div className="p-3">
              <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                {product.name}
              </h3>
              {product.serialNumber && (
                <p className="text-xs text-gray-600 mb-2">{product.serialNumber}</p>
              )}

              <div className="flex items-center justify-between mb-2">
                <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                  {getStatusText(product.status)}
                </Badge>
                <span className="text-xs text-gray-600">
                  คงเหลือ: {product.availableQuantity}
                </span>
              </div>

              <div className="text-xs text-gray-500 mb-2">
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
              <Button size="sm" variant="outline" className="w-full text-xs" disabled>
                ไม่พร้อมใช้งาน
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}