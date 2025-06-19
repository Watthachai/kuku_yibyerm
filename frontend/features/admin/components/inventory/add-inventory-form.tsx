"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInventoryForm } from "@/features/admin/hooks/useInventoryForm";
import { ProductSelectionComboBox } from "./product-selection-combobox"; // Component ใหม่ที่เราจะสร้าง
import { Package, MapPin, Loader2 } from "lucide-react";
import { AssetFormData } from "../../../../types/inventory";

interface AddInventoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddInventoryForm({
  onSuccess,
  onCancel,
}: AddInventoryFormProps) {
  const { form, products, isSubmitting, onSubmit } = useInventoryForm();

  const handleFormSubmit = async (data: AssetFormData) => {
    const success = await onSubmit(data);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              {/* Product Selection Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-ku-green rounded-lg">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    1. เลือกประเภทครุภัณฑ์
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>ค้นหาจากแคตตาล็อก</FormLabel>
                        <ProductSelectionComboBox
                          products={products}
                          onSelect={(product) => {
                            field.onChange(product.id);
                            // สามารถดึงข้อมูลอื่นมาใส่ฟอร์มได้ที่นี่ เช่น form.setValue('name', product.name)
                          }}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Asset Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    2. กรอกข้อมูลและที่ตั้ง
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  {/* ... นำ FormField สำหรับ assetCode, serialNumber, locationBuilding, locationRoom มาวางที่นี่ ... */}
                  {/* ตัวอย่าง */}
                  <FormField
                    control={form.control}
                    name="assetCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รหัสครุภัณฑ์ *</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น ELE-LCD-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* ... เพิ่ม field อื่นๆ ... */}
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </ScrollArea>

      {/* Footer Buttons */}
      <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={form.handleSubmit(handleFormSubmit)}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSubmitting ? "กำลังบันทึก..." : "เพิ่มครุภัณฑ์"}
        </Button>
      </div>
    </div>
  );
}
