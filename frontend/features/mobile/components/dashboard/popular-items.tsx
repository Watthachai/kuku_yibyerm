"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, Star, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: { name: string };
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "DAMAGED";
  rating: number;
  borrowCount: number;
}

interface PopularItemsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
}

export function PopularItems({ 
  searchTerm, 
}: PopularItemsProps) {
  const router = useRouter();

  // Mock data สำหรับครุภัณฑ์ที่แสดงในหน้าหลัก
  const items: Product[] = [
    {
      id: "1",
      name: "เครื่องฉายภาพ Epson EB-X41",
      category: { name: "อุปกรณ์โสตทัศนูปกรณ์" },
      status: "AVAILABLE",
      rating: 4.8,
      borrowCount: 156,
    },
    {
      id: "2",
      name: "เครื่องพิมพ์ HP LaserJet Pro",
      category: { name: "อุปกรณ์สำนักงาน" },
      status: "AVAILABLE",
      rating: 4.6,
      borrowCount: 134,
    },
    {
      id: "3",
      name: "กล้องถ่ายรูป Canon EOS",
      category: { name: "อุปกรณ์ถ่ายภาพ" },
      status: "IN_USE",
      rating: 4.9,
      borrowCount: 89,
    },
  ];

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

  const filteredItems = items.filter((item) => {
    return item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">
          {searchTerm ? `ผลการค้นหา "${searchTerm}"` : "ครุภัณฑ์ยอดนิยม"}
        </h3>
        {!searchTerm && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push("/inventory")}
          >
            ดูทั้งหมด
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.category.name}</p>
                  
                  <div className="flex items-center mt-2 space-x-3">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">{item.rating}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600 ml-1">{item.borrowCount} ครั้ง</span>
                    </div>
                    
                    <Badge 
                      className={`text-xs ${getStatusColor(item.status)}`}
                    >
                      {getStatusText(item.status)}
                    </Badge>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  disabled={item.status !== "AVAILABLE"}
                  className="bg-ku-green hover:bg-ku-green-dark"
                >
                  {item.status === "AVAILABLE" ? "เบิก" : "ดู"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}