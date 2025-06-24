// features/mobile-catalog/components/catalog/product-card.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
      "group relative overflow-hidden transition-all duration-200 hover:shadow-lg";

    switch (variant) {
      case "compact":
        return cn(baseClasses, "h-auto");
      case "featured":
        return cn(baseClasses, "h-full border-2 border-ku-green/20 shadow-md");
      default:
        return cn(baseClasses, "h-full");
    }
  };

  return (
    <Card className={cn(getCardClasses(), className)}>
      {/* ⭐ Product Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
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

        {/* ⭐ Favorite Button (แสดงเมื่อ hover) */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white/90 backdrop-blur-sm"
          onClick={handleToggleFavorite}
        >
          <Heart
            className={cn(
              "w-4 h-4",
              isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
            )}
          />
        </Button>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={cn("text-xs", getStatusColor(product.status))}>
            {getStatusText(product.status)}
          </Badge>
        </div>

        {/* Stock Badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          คงเหลือ {product.stock}
        </div>

        {/* ⭐ Featured Badge สำหรับ variant featured */}
        {variant === "featured" && (
          <div className="absolute top-2 right-12">
            <Badge className="bg-ku-green text-white text-xs">แนะนำ</Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardContent className={cn("p-4", variant === "compact" && "p-3")}>
        {/* Category & Department */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {product.category.name}
          </Badge>
          {product.department?.building && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              {product.department.building}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1 mb-3">
          <h3
            className={cn(
              "font-medium line-clamp-2 group-hover:text-ku-green transition-colors",
              variant === "compact" ? "text-sm" : "text-sm"
            )}
          >
            {product.name}
          </h3>

          {product.serialNumber && (
            <p className="text-xs text-gray-500 font-mono">
              รหัส: {product.serialNumber}
            </p>
          )}

          {variant !== "compact" && product.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Stats */}
        {variant !== "compact" && (
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
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
        <div
          className={cn(
            "flex gap-2",
            variant === "featured" ? "flex-col" : "flex-row"
          )}
        >
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "text-xs",
              variant === "featured" ? "w-full h-9" : "flex-1 h-8"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
          >
            <Info className="h-3 w-3 mr-1" />
            ดูรายละเอียด
          </Button>

          <Button
            size="sm"
            className={cn(
              "text-xs bg-ku-green hover:bg-ku-green-dark disabled:opacity-50",
              variant === "featured" ? "w-full h-9" : "flex-1 h-8"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={!isAvailable || !canAddMore || isLoading}
          >
            {isLoading ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
            ) : (
              <>
                <ShoppingCart className="h-3 w-3 mr-1" />
                {isInCart(product.id) ? `เพิ่ม (${inCartQuantity})` : "เบิก"}
              </>
            )}
          </Button>
        </div>

        {/* ⭐ เพิ่มข้อมูลเสริมสำหรับ featured variant */}
        {variant === "featured" && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-500">
                <span className="font-medium">แบรนด์:</span>{" "}
                {product.brand || "ไม่ระบุ"}
              </div>
              <div className="text-gray-500">
                <span className="font-medium">หน่วย:</span>{" "}
                {product.unit || "ชิ้น"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
