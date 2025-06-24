"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "../../stores/cart.store";
import { useDebounced } from "@/hooks/use-debounced"; // ⭐ เพิ่ม debounced hook
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { ProductGridSkeleton } from "./product-card-skeleton"; // ⭐ เพิ่ม skeleton

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
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]); // ⭐ เก็บข้อมูลทั้งหมด
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false); // ⭐ เพิ่ม searching state
  const [searchInput, setSearchInput] = useState(
    // ⭐ แยก input state
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || ""
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ⭐ Debounced search term (500ms delay)
  const debouncedSearchTerm = useDebounced(searchInput, 500);

  // ⭐ Load data from API (ครั้งเดียวเท่านั้น)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // เรียกใช้ ProductService ที่มีอยู่แล้ว
      const fetchedProducts = await ProductService.getProducts({});

      console.log("Loaded products:", fetchedProducts);

      // แปลงเป็น CatalogProduct
      const catalogProducts = fetchedProducts.map(
        convertProductToCatalogProduct
      );

      setAllProducts(catalogProducts);

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

      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลสินค้าครุภัณฑ์ได้");
    } finally {
      setLoading(false);
    }
  }, []); // ⭐ ไม่มี dependency เพื่อให้ load ครั้งเดียว

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ⭐ Sync search input กับ URL params เมื่อ component mount
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "";

    setSearchInput(urlSearchTerm);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  // ⭐ Filter products เมื่อ search term หรือ category เปลี่ยน
  useEffect(() => {
    if (allProducts.length === 0) return;

    // แสดง searching state เมื่อมีการค้นหา
    setSearching(searchInput !== debouncedSearchTerm);

    let filteredProducts = allProducts;

    // Filter by search term
    if (debouncedSearchTerm) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          product.category.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category.id === selectedCategory
      );
    }

    setProducts(filteredProducts);
  }, [allProducts, debouncedSearchTerm, selectedCategory, searchInput]); // ⭐ เปลี่ยนเป็น debouncedSearchTerm

  // ⭐ อัปเดต category count แยกออกมา
  useEffect(() => {
    if (allProducts.length === 0) return;

    setCategories((prevCategories) => {
      if (prevCategories.length === 0) return prevCategories;

      return prevCategories.map((category) => ({
        ...category,
        productCount: allProducts.filter(
          (product) =>
            product.category.id === category.id &&
            (!debouncedSearchTerm ||
              product.name
                .toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase()) ||
              product.description
                ?.toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase()))
        ).length,
      }));
    });
  }, [allProducts, debouncedSearchTerm]); // ⭐ เปลี่ยนเป็น debouncedSearchTerm

  // Handle search
  const handleSearch = (value: string) => {
    setSearchInput(value); // ⭐ อัปเดต input ทันที สำหรับ UI responsiveness
  };

  // ⭐ อัปเดต URL เมื่อ debounced search term เปลี่ยน
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm);
    } else {
      params.delete("search");
    }

    // ป้องกันการ push URL ซ้ำ
    const newUrl = `?${params.toString()}`;
    if (window.location.search !== newUrl) {
      router.push(newUrl);
    }
  }, [debouncedSearchTerm, router, searchParams]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">สินค้าครุภัณฑ์</h1>
            <p className="text-sm text-gray-600">เลือกครุภัณฑ์ที่ต้องการ</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
              <Package className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 text-lg font-medium">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-16 ${className}`}
    >
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                สินค้าครุภัณฑ์
              </h1>
              <p className="text-sm text-gray-600">
                ทั้งหมด{" "}
                <span className="font-semibold text-blue-600">
                  {allProducts.length}
                </span>{" "}
                รายการ
              </p>
            </div>

            {/* Cart Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/cart")}
                className="relative bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-all duration-200"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                ตะกร้า
                {getTotalItems() > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-red-600 shadow-lg"
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
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10 bg-white/60 backdrop-blur-sm border-gray-200/50 focus:bg-white/80 transition-all duration-200"
            />
            {/* Loading indicator สำหรับการค้นหา */}
            {searching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Filter Button */}
          <div className="flex items-center gap-2">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-all duration-200"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  ตัวกรอง
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[80vh] bg-white/90 backdrop-blur-lg border-t border-gray-200/50"
              >
                <SheetHeader>
                  <SheetTitle className="text-gray-900">
                    ตัวกรองหมวดหมู่
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="space-y-3">
                    <Button
                      variant={!selectedCategory ? "default" : "outline"}
                      onClick={() => {
                        handleCategoryChange("");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full justify-start transition-all duration-200 ${
                        !selectedCategory
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                          : "bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80"
                      }`}
                    >
                      ทั้งหมด (
                      {debouncedSearchTerm
                        ? allProducts.filter(
                            (product) =>
                              product.name
                                .toLowerCase()
                                .includes(debouncedSearchTerm.toLowerCase()) ||
                              product.description
                                ?.toLowerCase()
                                .includes(debouncedSearchTerm.toLowerCase()) ||
                              product.category.name
                                .toLowerCase()
                                .includes(debouncedSearchTerm.toLowerCase())
                          ).length
                        : allProducts.length}
                      )
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id
                            ? "default"
                            : "outline"
                        }
                        onClick={() => {
                          handleCategoryChange(category.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full justify-start transition-all duration-200 ${
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                            : "bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80"
                        }`}
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
              <Badge
                variant="secondary"
                className="text-xs bg-blue-50/80 text-blue-700 border border-blue-200/50 backdrop-blur-sm"
              >
                {categories.find((c) => c.id === selectedCategory)?.name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {loading ? (
          // Initial loading
          <ProductGridSkeleton />
        ) : searching ? (
          // Searching state (แสดง skeleton พร้อมข้อความ)
          <div className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border-0 shadow-lg text-center">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm font-medium">กำลังค้นหา...</p>
            </div>
            <ProductGridSkeleton />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border-0 shadow-xl text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              ไม่พบสินค้าครุภัณฑ์
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
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
