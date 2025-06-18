import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inventoryFormSchema,
  type InventoryFormValues,
} from "@/features/admin/lib/validations/inventory";
import { useToast } from "@/components/ui/use-toast";
import { type CreateInventoryItemData } from "@/types/inventory";

export function useInventoryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      code: "",
      category: "",
      condition: "GOOD",
      status: "AVAILABLE",
      building: "",
      room: "",
      department: "",
      tags: [],
    },
  });

  const generateCode = async (category: string, name: string) => {
    // Auto-generate code based on category and name
    const categoryCode = category.substring(0, 3).toUpperCase();
    const nameCode = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${categoryCode}${nameCode}${timestamp}`;
  };

  const handleCategoryChange = async (category: string) => {
    const name = form.getValues("name");
    if (name && !form.getValues("code")) {
      const generatedCode = await generateCode(category, name);
      form.setValue("code", generatedCode);
    }
  };

  const handleNameChange = async (name: string) => {
    const category = form.getValues("category");
    if (category && !form.getValues("code")) {
      const generatedCode = await generateCode(category, name);
      form.setValue("code", generatedCode);
    }
  };

  const onSubmit = async (data: InventoryFormValues) => {
    setIsSubmitting(true);
    try {
      // Transform form data to API format
      const inventoryData: CreateInventoryItemData = {
        ...data,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : undefined,
        warranty:
          data.warrantyStartDate && data.warrantyEndDate
            ? {
                startDate: new Date(data.warrantyStartDate),
                endDate: new Date(data.warrantyEndDate),
                terms: data.warrantyTerms,
              }
            : undefined,
        location: {
          building: data.building,
          room: data.room,
          department: data.department,
        },
        condition: data.condition as any,
        status: data.status as any,
        specifications: {},
        images: [],
      };

      // TODO: Call API to create inventory item
      // await InventoryService.createItem(inventoryData);

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "เพิ่มครุภัณฑ์สำเร็จ",
        description: `ครุภัณฑ์ "${data.name}" ถูกเพิ่มเข้าระบบแล้ว`,
      });

      form.reset();
      return true;
    } catch (error) {
      console.error("Failed to create inventory item:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มครุภัณฑ์ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit,
    handleCategoryChange,
    handleNameChange,
  };
}
