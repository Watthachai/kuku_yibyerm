"use client";

import { Item } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusStyle } from "@/lib/utils";
import Image from "next/image";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InventoryItemCardProps {
  item: Item;
  isAdmin: boolean;
}

export function InventoryItemCard({ item, isAdmin }: InventoryItemCardProps) {
  // ตรวจสอบว่า item มีข้อมูลครบหรือไม่
  if (!item) {
    return null;
  }

  const statusStyle = getStatusStyle(item.status);

  return (
    <Card
      key={item.id}
      className="hover:shadow-lg transition-shadow flex flex-col"
    >
      <CardHeader className="pb-3">
        <div className="w-full h-48 mb-3 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2 h-[56px]">
          {item.name}
        </CardTitle>
        <p className="text-sm text-gray-600">{item.assetCode}</p>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col flex-grow">
        <div className="space-y-2 flex-grow">
          <div className="flex items-center justify-between">
            <Badge className={statusStyle.color}>{statusStyle.text}</Badge>
            {item.quantity && (
              <span className="text-sm text-gray-600">
                คงเหลือ: {item.quantity}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            <p>หมวดหมู่: {item.category?.name || "ไม่ระบุหมวดหมู่"}</p>
            <p>หน่วยงาน: {item.department?.name || "ไม่ระบุหน่วยงาน"}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="pt-3 mt-4 border-t flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              แก้ไข
            </Button>
            <Button variant="destructive" size="sm" className="flex-1">
              ลบ
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
