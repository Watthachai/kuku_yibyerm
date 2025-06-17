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
  Users
} from "lucide-react";
import { Product } from "../../types/catalog.types";
import { useCartStore } from "../../hooks/use-cart-store";
import { ProductImage } from "./product-image";
import { StatusBadge } from "./status-badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export function ProductCard({ 
  product, 
  onViewDetails, 
  onAddToCart,
  className,
  variant = 'default'
}: ProductCardProps) {
  const { addItem, getItemQuantity, isInCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const inCartQuantity = getItemQuantity(product.id);
  const canAddMore = inCartQuantity < product.availableQuantity;
  const isAvailable = product.status === 'AVAILABLE' && product.availableQuantity > 0;

  const handleAddToCart = async () => {
    if (!canAddMore || !isAvailable) return;
    
    setIsLoading(true);
    try {
      await addItem(product);
      onAddToCart?.(product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const cardVariants = {
    default: "h-full",
    compact: "h-auto",
    featured: "h-full border-2 border-ku-green/20"
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: variant === 'featured' ? 1.02 : 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn("group cursor-pointer", className)}
      onClick={() => onViewDetails(product)}
    >
      <Card className={cn(
        "overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-0 bg-white relative",
        cardVariants[variant]
      )}>
        {/* Product Image */}
        <div className="relative">
          <ProductImage 
            src={product.imageUrl} 
            alt={product.name}
            className={cn(
              "w-full object-cover transition-transform duration-300 group-hover:scale-105",
              variant === 'compact' ? 'aspect-[4/3]' : 'aspect-square'
            )}
          />
          
          {/* Overlay Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <StatusBadge status={product.status} size="sm" />
            {product.usageCount && product.usageCount > 10 && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                ยอดนิยม
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
            onClick={handleToggleFavorite}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )} 
            />
          </Button>

          {/* Availability Badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            คงเหลือ {product.availableQuantity}
          </div>

          {/* Quick Add Button - Featured variant only */}
          {variant === 'featured' && isAvailable && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                size="sm"
                className="bg-ku-green hover:bg-ku-green-dark"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={!canAddMore || isLoading}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                เบิกด่วน
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-3 space-y-3">
          {/* Category & Department */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {product.category.name}
            </Badge>
            {product.department.building && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {product.department.building}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-1">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-ku-green transition-colors">
              {product.name}
            </h3>
            
            {product.serialNumber && (
              <p className="text-xs text-gray-500">
                รหัส: {product.serialNumber}
              </p>
            )}
            
            <p className="text-xs text-gray-600 line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
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

          {/* Actions */}
          {variant !== 'featured' && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
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
                className="flex-1 h-8 text-xs bg-ku-green hover:bg-ku-green-dark disabled:opacity-50"
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
                    {isInCart(product.id) ? `เพิ่ม (${inCartQuantity})` : 'เบิก'}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}