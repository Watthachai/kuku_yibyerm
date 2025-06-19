// features/admin/hooks/useInventory.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { Item } from "@/lib/utils";
import { InventoryService } from "../services/inventory-service";
import { useToast } from "@/components/ui/use-toast";

export function useInventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedItems = await InventoryService.getInventory({
        search: searchTerm,
      });
      setItems(fetchedItems);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลคลังครุภัณฑ์ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]); // ดึงข้อมูลใหม่เมื่อ searchTerm เปลี่ยน

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchItems();
    }, 500); // Debounce 500ms

    return () => clearTimeout(debounceTimer);
  }, [fetchItems]);

  return {
    items,
    loading,
    searchTerm,
    setSearchTerm,
    refreshItems: fetchItems, // ฟังก์ชันสำหรับ refresh ข้อมูล
  };
}
