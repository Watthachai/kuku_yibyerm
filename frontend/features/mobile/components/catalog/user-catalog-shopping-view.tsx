"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package, 
  Star, 
  TrendingUp,
  ShoppingCart,
  Plus,
  Minus
} from "lucide-react";
import { useCartStore } from "../../stores/cart.store";
import { CategoryFilter } from "./category-filter";
import { SearchHeader } from "./search-header";

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  imageUrl?: string;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "DAMAGED";
  availableQuantity: number;
  totalQuantity: number;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  department: {
    id: string;
    name: string;
  };
  rating?: number;
  borrowCount?: number;
  location?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  productCount: number;
}

export function UserCatalogShoppingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, getItemQuantity, getTotalItems } = useCartStore();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/inventory';
    router.replace(newUrl, { scroll: false });
  }, [searchTerm, selectedCategory, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      const mockCategories: Category[] = [
        {
          id: "1",
          name: "อุปกรณ์โสตทัศนูปกรณ์",
          icon: "📽️",
          color: "bg-blue-100 text-blue-800",
          productCount: 15,
        },
        {
          id: "2", 
          name: "อุปกรณ์สำนักงาน",
          icon: "🖨️",
          color: "bg-green-100 text-green-800",
          productCount: 12,
        },
        {
          id: "3",
          name: "อุปกรณ์ถ่ายภาพ",
          icon: "📷",
          color: "bg-purple-100 text-purple-800",
          productCount: 8,
        },
        {
          id: "4",
          name: "อุปกรณ์คอมพิวเตอร์",
          icon: "💻",
          color: "bg-orange-100 text-orange-800",
          productCount: 20,
        },
      ];

      const mockProducts: Product[] = [
        {
          id: "1",
          name: "เครื่องฉายภาพ Epson EB-X41",
          code: "EP001-2024",
          description: "เครื่องฉายภาพ 3LCD สำหรับห้องเรียน ความสว่าง 3600 ลูเมน",
          status: "AVAILABLE",
          availableQuantity: 3,
          totalQuantity: 5,
          category: {
            id: "1",
            name: "อุปกรณ์โสตทัศนูปกรณ์",
            icon: "📽️",
            color: "bg-blue-100 text-blue-800",
          },
          department: {
            id: "1",
            name: "คณะเกษตร",
          },
          rating: 4.8,
          borrowCount: 156,
          location: "ห้อง 301 อาคาร A",
        },
        {
          id: "2",
          name: "เครื่องพิมพ์ HP LaserJet Pro M404n",
          code: "HP002-2024",
          description: "เครื่องพิมพ์เลเซอร์ขาวดำ ความเร็วพิมพ์ 38 หน้าต่อนาที",
          status: "AVAILABLE",
          availableQuantity: 2,
          totalQuantity: 3,
          category: {
            id: "2",
            name: "อุปกรณ์สำนักงาน",
            icon: "🖨️",
            color: "bg-green-100 text-green-800",
          },
          department: {
            id: "2",
            name: "คณะวิศวกรรมศาสตร์",
          },
          rating: 4.6,
          borrowCount: 134,
          location: "ห้อง 205 อาคาร B",
        },
        {
          id: "3",
          name: "กล้องถ่ายรูป Canon EOS 2000D",
          code: "CN003-2024",
          description: "กล้อง DSLR สำหรับงานถ่ายภาพ เซ็นเซอร์ APS-C 24.1 MP",
          status: "IN_USE",
          availableQuantity: 0,
          totalQuantity: 2,
          category: {
            id: "3",
            name: "อุปกรณ์ถ่ายภาพ",
            icon: "📷",
            color: "bg-purple-100 text-purple-800",
          },
          department: {
            id: "3",
            name: "คณะมนุษยศาสตร์",
          },
          rating: 4.9,
          borrowCount: 89,
          location: "ห้อง 102 อาคาร C",
        },
        {
          id: "4",
          name: "แล็ปท็อป Lenovo ThinkPad E14",
          code: "LN004-2024",
          description: "แล็ปท็อป Intel Core i5 RAM 8GB SSD 256GB",
          status: "AVAILABLE",
          availableQuantity: 5,
          totalQuantity: 8,
          category: {
            id: "4",
            name: "อุปกรณ์คอมพิวเตอร์",
            icon: "💻",
            color: "bg-orange-100 text-orange-800",
          },
          department: {
            id: "4",
            name: "คณะเทคโนโลยีสารสนเทศ",
          },
          rating: 4.7,
          borrowCount: 201,
          location: "ห้อง 401 อาคาร D",
        },
      ];

      setCategories(mockCategories);
      setProducts(mockProducts);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get status display
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-800";
      case "IN_USE": return "bg-blue-100 text-blue-800";
      case "MAINTENANCE": return "bg-yellow-100 text-yellow-800";
      case "DAMAGED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "พร้อมใช้งาน";
      case "IN_USE": return "กำลังใช้งาน";
      case "MAINTENANCE": return "ซ่อมบำรุง";
      case "DAMAGED": return "ชำรุด";
      default: return status;
    }
  };

  // Cart functions
  const handleAddToCart = (product: Product) => {
    if (product.status === "AVAILABLE" && product.availableQuantity > 0) {
      addItem(product.id, product.name, 1);
    }
  };

  const handleQuantityChange = (product: Product, change: number) => {
    const currentQuantity = getItemQuantity(product.id);
    const newQuantity = currentQuantity + change;
    
    if (newQuantity <= 0) {
      // Remove from cart logic will be handled by the store
      return;
    }
    
    if (newQuantity <= product.availableQuantity) {
      if (change > 0) {
        addItem(product.id, product.name, change);
      }
      // For decrease, we'll need to implement updateQuantity in store
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b p-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onBack={() => router.back()}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      {/* Category Filter */}
      {showFilters && (
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {searchTerm ? `ผลการค้นหา "${searchTerm}"` : 
               selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 
               'ครุภัณฑ์ทั้งหมด'}
            </h2>
            <p className="text-sm text-gray-600">
              พบ {filteredProducts.length} รายการ
            </p>
          </div>
          
          {getTotalItems() > 0 && (
            <Button
              onClick={() => router.push('/mobile/cart')}
              className="bg-ku-green hover:bg-ku-green-dark relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              ตะกร้า
              <Badge
                variant="secondary"
                className="ml-2 bg-white text-ku-green"
              >
                {getTotalItems()}
              </Badge>
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ไม่พบครุภัณฑ์
                </h3>
                <p className="text-gray-600 mb-4">
                  ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ใหม่
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                >
                  ล้างตัวกรอง
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => {
              const inCartQuantity = getItemQuantity(product.id);
              const canAddMore = inCartQuantity < product.availableQuantity;
              
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">
                          {product.category.icon}
                        </span>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {product.code}
                            </p>
                          </div>
                          <Badge className={`ml-2 ${getStatusColor(product.status)}`}>
                            {getStatusText(product.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        {/* Stats */}
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            {product.rating?.toFixed(1)}
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {product.borrowCount} ครั้ง
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Package className="w-3 h-3 mr-1" />
                            คงเหลือ {product.availableQuantity}/{product.totalQuantity}
                          </div>
                        </div>
                        
                        {/* Location */}
                        {product.location && (
                          <p className="text-xs text-gray-500 mb-3">
                            📍 {product.location}
                          </p>
                        )}
                        
                        {/* Add to Cart */}
                        <div className="flex items-center space-x-2">
                          {inCartQuantity === 0 ? (
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.status !== "AVAILABLE" || product.availableQuantity === 0}
                              className="bg-ku-green hover:bg-ku-green-dark flex-1"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              เพิ่มลงตะกร้า
                            </Button>
                          ) : (
                            <div className="flex items-center space-x-2 flex-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(product, -1)}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              
                              <div className="flex-1 text-center">
                                <span className="text-sm font-medium">
                                  ในตะกร้า: {inCartQuantity}
                                </span>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(product, 1)}
                                disabled={!canAddMore}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}