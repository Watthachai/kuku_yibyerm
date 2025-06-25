"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter } from "lucide-react";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onBack: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export function SearchHeader({
  searchTerm,
  onSearchChange,
  onBack,
  onToggleFilters,
  showFilters,
}: SearchHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center p-4 space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="ค้นหาครุภัณฑ์..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant={showFilters ? "default" : "ghost"}
          size="sm"
          onClick={onToggleFilters}
          className="p-2"
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
