"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addAssetSchema } from "../schemas/asset-schema";
import { AssetFormData, Product } from "@/types/inventory";
import { useToast } from "@/components/ui/use-toast";
import { AssetService } from "../services/asset-service";
import { ProductService } from "../services/product-service";

export function useInventoryDialog(onSuccess: () => void) {
  const [view, setView] = useState<"SELECT_PRODUCT" | "CREATE_PRODUCT">(
    "SELECT_PRODUCT"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const { toast } = useToast();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(addAssetSchema),
    defaultValues: {
      productId: undefined,
      trackingMethod: "BY_ITEM",
      assetCode: "",
      serialNumber: "",
      status: "AVAILABLE",
      locationBuilding: undefined,
      locationRoom: "",
      quantity: 1,
    },
  });

  const fetchProducts = async () => {
    const productData = await ProductService.getProductsForSelection();
    setProducts(productData);
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductSelect = (product: Product | null) => {
    if (product) {
      form.reset();
      form.setValue("productId", product.id);
      form.setValue("trackingMethod", product.trackingMethod);
      form.clearErrors();
    }
  };

  const handleSwitchToCreate = (searchTerm: string) => {
    setNewProductName(searchTerm);
    setView("CREATE_PRODUCT");
  };

  const handleProductCreated = (newProduct: Product) => {
    fetchProducts(); // Refresh list
    handleProductSelect(newProduct);
    setView("SELECT_PRODUCT");
  };

  const onAssetSubmit = async (data: AssetFormData) => {
    setIsSubmitting(true);
    try {
      await AssetService.createAsset(data);
      toast({
        title: "สำเร็จ!",
        description: "เพิ่มครุภัณฑ์ใหม่เรียบร้อยแล้ว",
      });
      onSuccess();
    } catch (error: unknown) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    view,
    setView,
    form,
    products,
    isSubmitting,
    onAssetSubmit,
    handleProductSelect,
    handleSwitchToCreate,
    handleProductCreated,
    newProductName,
  };
}
