"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductService, Product, Category as APICategory } from "@/lib/api/product.service";
import { useCartStore } from "../../stores/cart.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Plus, 
  Minus,
  MapPin,
  Star,
  Package
} from "lucide-react";
import { toast } from "sonner";

// Extend API Category to include productCount
interface Category extends APICategory {
  productCount?: number;
}

interface Props {
  className?: string;
}

export function UserCatalogShoppingView({ className }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, getItemQuantity, getTotalItems, cart } = useCartStore();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [productsData, categoriesData] = await Promise.all([
        ProductService.getProducts({
          search: searchTerm || undefined,
          categoryId: selectedCategory || undefined,
          status: 'AVAILABLE',
        }),
        ProductService.getCategories(),
      ]);

      setProducts(productsData.products);
      
      // Add productCount to categories
      const categoriesWithCount = categoriesData.map(category => ({
        ...category,
        productCount: productsData.products.filter(p => p.category.id === category.id).length
      }));
      
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลครุภัณฑ์ได้",
        variant: "destructive",
      });
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
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  };

  // Handle category filter
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    router.push(`?${params.toString()}`);
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    if (product.availableQuantity <= 0) {
      toast({
        title: "ไม่สามารถเพิ่มได้",
        description: "ครุภัณฑ์นี้ไม่มีในสต็อก",
        variant: "destructive",
      });
      return;
    }

    addItem(product, 1);
    toast({
      title: "เพิ่มลงตะกร้าแล้ว",
      description: `${product.name} ถูกเพิ่มลงตะกร้าเรียบร้อยแล้ว`,
    });
  };

  // Handle quantity change
  const handleQuantityChange = (product: Product, change: number) => {
    const currentQuantity = getItemQuantity(product.id);
    const newQuantity = currentQuantity + change;

    if (newQuantity <= 0) {
      return;
    }

    if (newQuantity > product.availableQuantity) {
      toast({
        title: "จำนวนเกินที่มีในสต็อก",
        description: `มีครุภัณฑ์นี้เหลือเพียง ${product.availableQuantity} ชิ้น`,
        variant: "destructive",
      });
      return;
    }

    addItem(product, change);
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
          <h1 className="text-xl font-bold text-gray-900">เบิกครุภัณฑ์</h1>
          
          {/* Cart Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/mobile/cart')}
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
            placeholder="ค้นหาครุภัณฑ์..."
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
                      handleCategoryChange('');
                      setIsFilterOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    ทั้งหมด ({products.length})
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
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
              {categories.find(c => c.id === selectedCategory)?.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">ไม่พบครุภัณฑ์</p>
            <p className="text-gray-400 text-sm">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => {
              const isAvailable = product.status === "AVAILABLE" && product.availableQuantity > 0;
              const cartQuantity = getItemQuantity(product.id);

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <Badge 
                      variant={isAvailable ? "default" : "secondary"}
                      className="absolute top-2 left-2 text-xs"
                    >
                      {isAvailable ? "พร้อมใช้" : "ไม่พร้อมใช้"}
                    </Badge>
                  </div>

                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      {product.code}
                    </p>

                    {/* Category */}
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <span className="mr-1">{product.category.icon}</span>
                      {product.category.name}
                    </div>

                    {/* Location & Quantity */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{product.location || "ไม่ระบุ"}</span>
                      </div>
                      <span>คงเหลือ: {product.availableQuantity}</span>
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center mb-3">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 ml-1">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {cartQuantity > 0 ? (
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(product, -1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="text-sm font-medium px-3">
                          {cartQuantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(product, 1)}
                          disabled={cartQuantity >= product.availableQuantity}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={!isAvailable}
                        className="w-full bg-ku-green hover:bg-ku-green-dark text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        เพิ่มลงตะกร้า
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}