"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, Package, Calendar } from "lucide-react";
import { CartItem as CartItemType } from "../../types/cart.types";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdatePurpose: (itemId: string, purpose: string) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onRemove: (itemId: string) => void;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onUpdatePurpose,
  onUpdateNotes,
  onRemove,
}: CartItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity >= 1 && newQuantity <= item.product.availableQuantity) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Main Item Display */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Product Image */}
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
            {item.product.imageUrl ? (
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
              {item.product.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {item.product.category.name}
            </p>
            {item.product.code && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                รหัส: {item.product.code}
              </p>
            )}
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="text-red-600 hover:text-red-700 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            <Label className="text-sm">จำนวน:</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(-1)}
                disabled={item.quantity <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>

              <span className="w-12 text-center text-sm font-medium">
                {item.quantity}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(1)}
                disabled={item.quantity >= item.product.availableQuantity}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-ku-green"
          >
            {showDetails ? "ซ่อนรายละเอียด" : "แสดงรายละเอียด"}
          </Button>
        </div>

        {/* Period Display */}
        <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {new Date(item.requestPeriod.startDate).toLocaleDateString("th-TH")}{" "}
            -{new Date(item.requestPeriod.endDate).toLocaleDateString("th-TH")}
          </span>
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            ({item.requestPeriod.duration} วัน)
          </span>
        </div>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 space-y-4">
          {/* Purpose */}
          <div>
            <Label
              htmlFor={`purpose-${item.id}`}
              className="text-sm font-medium"
            >
              วัตถุประสงค์ <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`purpose-${item.id}`}
              value={item.purpose}
              onChange={(e) => onUpdatePurpose(item.id, e.target.value)}
              placeholder="ระบุวัตถุประสงค์การใช้งาน"
              className="mt-1"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor={`notes-${item.id}`} className="text-sm font-medium">
              หมายเหตุ
            </Label>
            <Textarea
              id={`notes-${item.id}`}
              value={item.notes || ""}
              onChange={(e) => onUpdateNotes(item.id, e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Product Details */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              รายละเอียดครุภัณฑ์
            </h4>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
              <p>
                <span className="font-medium">หน่วยงาน:</span>{" "}
                {item.product.department.name}
              </p>
              <p>
                <span className="font-medium">สถานะ:</span> พร้อมใช้งาน
              </p>
              <p>
                <span className="font-medium">จำนวนที่มี:</span>{" "}
                {item.product.availableQuantity} จาก{" "}
                {item.product.totalQuantity}
              </p>
              {item.product.location && (
                <p>
                  <span className="font-medium">สถานที่:</span>{" "}
                  {item.product.location}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
