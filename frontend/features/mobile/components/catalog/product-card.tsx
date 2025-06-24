// features/mobile-catalog/components/catalog/product-card.tsx
"use client";

import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Heart,
  Info,
  Star,
  MapPin,
  Users,
  Package, // ⭐ เพิ่ม Package import
} from "lucide-react";
import {
  CatalogProduct,
  convertCatalogProductToProduct,
} from "../../types/catalog.types";
import { useCartStore } from "../../stores/cart.store";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: CatalogProduct;
  onViewDetails: (product: CatalogProduct) => void;
  onAddToCart?: (product: CatalogProduct) => void;
  className?: string;
  variant?: "default" | "compact" | "featured";
}

// ⭐ Helper functions สำหรับ status
const getStatusColor = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-100 text-green-800";
    case "BORROWED":
      return "bg-yellow-100 text-yellow-800";
    case "MAINTENANCE":
      return "bg-orange-100 text-orange-800";
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
    case "BORROWED":
      return "ถูกยืม";
    case "MAINTENANCE":
      return "ซ่อมบำรุง";
    case "DAMAGED":
      return "ชำรุด";
    default:
      return "ไม่ระบุ";
  }
};

export function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  className,
  variant = "default",
}: ProductCardProps) {
  const { addItem, getItemQuantity, isInCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const inCartQuantity = getItemQuantity(product.id);
  const canAddMore = inCartQuantity < product.stock;
  const isAvailable = product.status === "AVAILABLE" && product.stock > 0;

  // ⭐ Debug logging สำหรับรูปภาพ
  console.log(`Product ${product.name} imageUrl:`, product.imageUrl);

  const handleAddToCart = async () => {
    if (!canAddMore || !isAvailable) return;

    setIsLoading(true);
    try {
      const cartProduct = convertCatalogProductToProduct(product);
      await addItem(cartProduct);
      onAddToCart?.(product);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    // TODO: ส่งข้อมูลไปบันทึกใน backend
  };

  const handleImageError = () => {
    console.error(
      `Failed to load image for ${product.name}:`,
      product.imageUrl
    );
    setImageError(true);
  };

  // ⭐ Card variants สำหรับ styling
  const getCardClasses = () => {
    const baseClasses =
      "group relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 backdrop-blur-sm border-0 shadow-xl rounded-lg";

    switch (variant) {
      case "compact":
        return cn(baseClasses, "h-auto");
      case "featured":
        return cn(baseClasses, "h-full border-2 border-blue-200/50 shadow-2xl");
      default:
        return cn(baseClasses, "h-full");
    }
  };

  return (
    <div className={cn(getCardClasses(), className)}>
      {/* ⭐ Product Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {product.imageUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={handleImageError}
            loading="lazy"
            referrerPolicy="no-referrer" // ⭐ เพิ่มเพื่อแก้ปัญหา CORS
          />
        ) : (
          // ⭐ แสดง placeholder เมื่อไม่มีรูปภาพ
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
            <Package className="w-16 h-16 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500 text-center px-2">
              {imageError ? "โหลดรูปภาพไม่ได้" : "ไม่มีรูปภาพ"}
            </span>
          </div>
        )}

        {/* ⭐ Action Buttons Overlay (แสดงเมื่อ hover) */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* View Details Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 bg-white/80 hover:bg-white/90 backdrop-blur-lg shadow-lg rounded-xl transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
          >
            <Info className="w-4 h-4 text-gray-700" />
          </Button>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 bg-white/80 hover:bg-white/90 backdrop-blur-lg shadow-lg rounded-xl transition-all duration-200"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={cn(
                "w-4 h-4",
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-700"
              )}
            />
          </Button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge
            className={cn(
              "text-xs backdrop-blur-sm border-0 shadow-lg",
              getStatusColor(product.status)
            )}
          >
            {getStatusText(product.status)}
          </Badge>
        </div>

        {/* Stock Badge */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-lg text-white text-xs px-3 py-1.5 rounded-xl shadow-lg border border-white/20">
          คงเหลือ {product.stock}
        </div>

        {/* ⭐ Featured Badge สำหรับ variant featured */}
        {variant === "featured" && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-gradient-to-r from-ku-green to-emerald-600 text-white text-xs border-0 shadow-lg backdrop-blur-sm">
              แนะนำ
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardContent
        className={cn(
          "p-4 bg-gradient-to-b from-white/40 to-white/60 backdrop-blur-sm",
          variant === "compact" && "p-3"
        )}
      >
        {/* Category & Department */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant="outline"
            className="text-xs bg-white/60 backdrop-blur-sm border-gray-200/50"
          >
            {product.category.name}
          </Badge>
          {product.department?.building && (
            <div className="flex items-center text-xs text-gray-500 bg-white/40 backdrop-blur-sm px-2 py-1 rounded-lg">
              <MapPin className="w-3 h-3 mr-1" />
              {product.department.building}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2 mb-4">
          <h3
            className={cn(
              "font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug",
              variant === "compact" ? "text-sm" : "text-sm"
            )}
          >
            {product.name}
          </h3>

          {product.serialNumber && (
            <p className="text-xs text-gray-500 font-mono bg-gray-50/80 backdrop-blur-sm px-2 py-1 rounded-lg">
              รหัส: {product.serialNumber}
            </p>
          )}

          {variant !== "compact" && product.description && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Stats */}
        {variant !== "compact" && (
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4 bg-white/40 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              ใช้ {product.usageCount || 0} ครั้ง
            </div>
            {product.rating && (
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {product.rating.toFixed(1)}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {/* Add to Cart Button - Full Width */}
          <Button
            size="sm"
            className="w-full h-9 text-sm bg-gradient-to-r from-ku-green to-emerald-600 hover:from-ku-green-dark hover:to-emerald-700 disabled:opacity-50 shadow-lg transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={!isAvailable || !canAddMore || isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isInCart(product.id) ? `เพิ่ม (${inCartQuantity})` : "เบิก"}
              </>
            )}
          </Button>
        </div>

        {/* ⭐ เพิ่มข้อมูลเสริมสำหรับ featured variant */}
        {variant === "featured" && (
          <div className="mt-3 pt-3 border-t border-gray-100/50">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-500 bg-white/40 backdrop-blur-sm rounded-lg p-2">
                <span className="font-medium">แบรนด์:</span>{" "}
                {product.brand || "ไม่ระบุ"}
              </div>
              <div className="text-gray-500 bg-white/40 backdrop-blur-sm rounded-lg p-2">
                <span className="font-medium">หน่วย:</span>{" "}
                {product.unit || "ชิ้น"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}
