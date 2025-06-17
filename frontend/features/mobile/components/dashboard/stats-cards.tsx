"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock } from "lucide-react";

interface StatsCardsProps {
  stats: {
    borrowedItems: number;
    pendingRequests: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 px-2">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-green-700 mb-1">{stats.borrowedItems}</div>
          <div className="text-sm text-green-600 font-medium">กำลังยืม</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-yellow-700 mb-1">{stats.pendingRequests}</div>
          <div className="text-sm text-yellow-600 font-medium">รออนุมัติ</div>
        </CardContent>
      </Card>
    </div>
  );
}
