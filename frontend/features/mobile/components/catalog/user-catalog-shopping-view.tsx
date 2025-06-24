"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "../../stores/cart.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Filter, ShoppingCart, Package } from "lucide-react";
import { toast } from "sonner";
// ⭐ Import ProductService และ types ที่ถูกต้อง
import { ProductService } from "@/features/admin/services/product-service";
import {
  CatalogProduct,
  convertProductToCatalogProduct,
  convertCatalogProductToProduct,
} from "@/features/mobile/types/catalog.types";
import { ProductCard } from "./product-card";

// ⭐ Define Category type ให้ตรงกับระบบ
interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  productCount?: number;
}

interface Props {
  className?: string;
}

export function UserCatalogShoppingView({ className }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, getTotalItems } = useCartStore();

  // State
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || ""
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ⭐ Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // เรียกใช้ ProductService ที่มีอยู่แล้ว
      const fetchedProducts = await ProductService.getProducts({
        search: searchTerm || undefined,
      });

      console.log("Loaded products:", fetchedProducts);

      // แปลงเป็น CatalogProduct
      const catalogProducts = fetchedProducts.map(
        convertProductToCatalogProduct
      );

      // Filter ตาม category ถ้ามี
      let filteredProducts = catalogProducts;
      if (selectedCategory) {
        filteredProducts = catalogProducts.filter(
          (product) => product.category.id === selectedCategory
        );
      }

      setProducts(filteredProducts);

      // สร้าง categories จาก products ที่มี
      const uniqueCategories = Array.from(
        new Map(
          fetchedProducts
            .filter((p) => p.category && p.category.id)
            .map((p) => [
              p.category!.id,
              {
                id: p.category!.id,
                name: p.category!.name,
                icon: "📦",
                isActive: true,
                productCount: 0,
              },
            ])
        ).values()
      );

      // นับจำนวนสินค้าแต่ละหมวดหมู่
      const categoriesWithCount = uniqueCategories.map((category) => ({
        ...category,
        productCount: filteredProducts.filter(
          (product) => product.category.id === category.id
        ).length,
      }));

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลสินค้าครุภัณฑ์ได้");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  // Handle category filter
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`);
  };

  // Handle add to cart
  const handleAddToCart = (product: CatalogProduct) => {
    if (product.stock <= 0) {
      toast.error("สินค้าครุภัณฑ์นี้ไม่มีในสต็อก");
      return;
    }

    const productForCart = convertCatalogProductToProduct(product);
    addItem(productForCart, 1);
    toast.success(`${product.name} ถูกเพิ่มลงตะกร้าเรียบร้อยแล้ว`);
  };

  // Handle view details
  const handleViewDetails = (product: CatalogProduct) => {
    // TODO: Implement product detail view
    console.log("View details for:", product);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-ku-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 p-4 border-b shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">สินค้าครุภัณฑ์</h1>

          {/* Cart Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/cart")}
              className="relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              ตะกร้า
              {getTotalItems() > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="ค้นหาสินค้าครุภัณฑ์..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Button */}
        <div className="flex items-center gap-2">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                ตัวกรอง
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="py-4">
                <h3 className="text-lg font-semibold mb-4">หมวดหมู่</h3>
                <div className="space-y-2">
                  <Button
                    variant={!selectedCategory ? "default" : "outline"}
                    onClick={() => {
                      handleCategoryChange("");
                      setIsFilterOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    ทั้งหมด ({products.length})
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      onClick={() => {
                        handleCategoryChange(category.id);
                        setIsFilterOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name} ({category.productCount || 0})
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {selectedCategory && (
            <Badge variant="secondary" className="text-xs">
              {categories.find((c) => c.id === selectedCategory)?.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">ไม่พบสินค้าครุภัณฑ์</p>
            <p className="text-gray-400 text-sm">
              ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewDetails}
                onAddToCart={handleAddToCart}
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
