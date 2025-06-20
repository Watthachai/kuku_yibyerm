"use client";

import { Item } from "@/types/inventory";
import { InventoryItemCard } from "./inventory-item-card";
import { Package } from "lucide-react";
import { GridSkeleton } from "@/components/ui/skeleton";

interface InventoryGridProps {
  items: Item[];
  isAdmin: boolean;
  isLoading?: boolean;
}

export function InventoryGrid({
  items,
  isAdmin,
  isLoading = false,
}: InventoryGridProps) {
  // แสดง Loading Skeleton
  if (isLoading) {
    return <GridSkeleton />;
  }

  // แสดงเมื่อไม่มีข้อมูล
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ไม่พบครุภัณฑ์
        </h3>
        <p className="text-gray-500 max-w-sm">
          ยังไม่มีครุภัณฑ์ในระบบ หรือลองปรับเปลี่ยนตัวกรองการค้นหา
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <InventoryItemCard key={item.id} item={item} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
