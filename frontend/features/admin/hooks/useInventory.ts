"use client";

import { useState, useEffect, useCallback } from "react";
import { Item } from "@/types/inventory";
import { InventoryService } from "../services/inventory-service";
import { useToast } from "@/components/ui/use-toast";

export function useInventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // ⭐ เพิ่ม State สำหรับ Filter ทั้งหมด
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    try {
      // ไม่ต้อง setLoading(true) ที่นี่ เพราะจะทำให้หน้ากระพริบตอนพิมพ์
      const query = {
        search: searchTerm,
        departmentId: selectedDepartment,
        categoryId: selectedCategory,
      };
      const fetchedItems = await InventoryService.getInventory(query);
      setItems(fetchedItems);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลคลังครุภัณฑ์ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // หยุด Loading เมื่อ fetch เสร็จ
    }
  }, [searchTerm, selectedDepartment, selectedCategory, toast]);

  useEffect(() => {
    setLoading(true); // setLoading ที่นี่แทน เพื่อให้แสดง Skeleton ตอน filter
    const debounceTimer = setTimeout(() => {
      fetchItems();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [fetchItems]);

  // ⭐ ส่ง State และ Setter ทั้งหมดออกไปให้หน้า Page ใช้
  return {
    items,
    loading,
    searchTerm,
    setSearchTerm,
    selectedDepartment,
    setSelectedDepartment,
    selectedCategory,
    setSelectedCategory,
    refreshItems: fetchItems,
  };
}
