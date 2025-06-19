"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addAssetSchema } from "../schemas/asset-schema";
import { AssetFormData, Product } from "@/types/inventory";
import { useToast } from "@/components/ui/use-toast";
import { AssetService } from "../services/asset-service"; // เราจะสร้าง/แก้ไข Service นี้ต่อไป
import { ProductService } from "../services/product-service"; // และ Service นี้

export function useInventoryForm() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]); // State สำหรับเก็บ Product ทั้งหมด
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(addAssetSchema),
  });

  // ดึงข้อมูล Product ทั้งหมดมาเพื่อใช้ใน ComboBox
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await ProductService.getProductsForSelection();
        setProducts(productData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // ฟังก์ชันสำหรับส่งข้อมูลที่ผ่านการ Validate แล้ว
  const onSubmit = async (data: AssetFormData) => {
    setIsSubmitting(true);
    try {
      // Find the product name from the products array using productId
      const selectedProduct = products.find((p) => p.id === data.productId);
      const assetData = {
        ...data,
        name: selectedProduct?.name || `Asset ${data.assetCode}`, // Add required name property
      };
      await AssetService.createAsset(assetData); // เรียก API service เพื่อสร้าง Asset
      toast({
        title: "สำเร็จ!",
        description: "เพิ่มครุภัณฑ์ใหม่เข้าระบบเรียบร้อยแล้ว",
      });
      return true; // คืนค่า true เพื่อบอกว่าสำเร็จ
    } catch (error: unknown) {
      console.error("Failed to create asset:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error ? error.message : "ไม่สามารถเพิ่มครุภัณฑ์ได้",
        variant: "destructive",
      });
      return false; // คืนค่า false เพื่อบอกว่าล้มเหลว
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, products, isSubmitting, onSubmit };
}
