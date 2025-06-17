"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ShoppingCart, X } from "lucide-react";

interface MobileHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  cartItemCount: number;
  onCartClick: () => void;
}

export function MobileHeader({
  searchTerm,
  onSearchChange,
  onFilterClick,
  cartItemCount,
  onCartClick,
}: MobileHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      {showSearch ? (
        <div className="flex items-center p-4 space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหาครุภัณฑ์..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">คลังครุภัณฑ์</h1>
            <p className="text-sm text-gray-600">มหาวิทยาลัยเกษตรศาสตร์</p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={onFilterClick}>
              <Filter className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-ku-green text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}