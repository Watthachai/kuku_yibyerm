"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Product } from "@/types/inventory";

interface ProductSelectionComboBoxProps {
  products: Product[];
  onSelect: (product: Product | null) => void;
  onAddNew: (searchTerm: string) => void;
  selectedProduct?: Product | null;
}

export function ProductSelectionComboBox({
  products,
  onSelect,
  onAddNew,
  selectedProduct,
}: ProductSelectionComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSelect = (product: Product) => {
    onSelect(product);
    setOpen(false);
  };

  const handleAddNew = () => {
    onAddNew(searchTerm);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 text-base"
        >
          {selectedProduct?.name || "เลือกประเภทครุภัณฑ์..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          {/* ⭐ แยกส่วน Input และปุ่มเพิ่ม */}
          <div className="flex items-center border-b px-3">
            <CommandInput
              placeholder="ค้นหาชื่อ, รุ่น, หรือยี่ห้อ..."
              onValueChange={setSearchTerm}
              className="flex-1 border-none outline-none"
            />
            {/* ⭐ ปุ่มเพิ่มข้างๆ ช่องค้นหา */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAddNew}
              disabled={!searchTerm.trim()}
              className="ml-2 h-8 px-2 text-ku-green hover:text-ku-green-dark hover:bg-ku-green/10"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              สร้างใหม่
            </Button>
          </div>

          <CommandList>
            <CommandEmpty>
              <div className="text-sm p-4 text-center text-gray-500">
                <p>ไม่พบประเภทครุภัณฑ์ที่ต้องการ</p>
                {searchTerm.trim() && (
                  <div
                    className="text-ku-green font-semibold flex items-center justify-center gap-2 mt-2 cursor-pointer hover:text-ku-green-dark"
                    onClick={handleAddNew}
                  >
                    <PlusCircle className="h-4 w-4" />
                    สร้างประเภท &quot;{searchTerm}&quot; ใหม่
                  </div>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => handleSelect(product)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProduct?.id === product.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    {(product.brand || product.productModel) && (
                      <span className="text-sm text-gray-500">
                        {[product.brand, product.productModel]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
