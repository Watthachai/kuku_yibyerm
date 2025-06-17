"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  productCount: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">หมวดหมู่</h3>
        {selectedCategory && (
          <button
            onClick={() => onCategoryChange('')}
            className="text-sm text-ku-green hover:text-ku-green-dark"
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex space-x-2 pb-2">
          <Badge
            variant={!selectedCategory ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => onCategoryChange('')}
          >
            ทั้งหมด
          </Badge>
          
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => onCategoryChange(category.id)}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
              <span className="ml-1 text-xs">({category.productCount})</span>
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}