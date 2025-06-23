"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types/product"; // ตรวจสอบว่า path นี้ถูกต้อง
import {} from "../services/product-service"; // ตรวจสอบว่า path นี้ถูกต้อง
import { useToast } from "@/components/ui/use-toast";
import { ProductService } from "../services/product-service"; // ตรวจสอบว่า path นี้ถูกต้อง

export function useInventory() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
      const fetchedItems = await ProductService.getProducts(query);
      setItems(fetchedItems);
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลคลังครุภัณฑ์ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDepartment, selectedCategory, toast]);

  useEffect(() => {
    setLoading(true);
    const debounceTimer = setTimeout(() => {
      fetchItems();
    }, 300); // หน่วงเวลา 0.3 วินาทีเพื่อลดการยิง API ขณะพิมพ์

    return () => clearTimeout(debounceTimer);
  }, [fetchItems]);

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
