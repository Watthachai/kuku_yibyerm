"use client";

import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Info } from "lucide-react";
import { useInventoryDialog } from "@/features/admin/hooks/useInventoryDialog";
import { ProductSelectionComboBox } from "./product-selection-combobox";
import { CreateProductForm } from "./create-product-form";
import { FormSectionDurable } from "./form-section-durable";
import { FormSectionConsumable } from "./form-section-consumable";
import { FormSectionLocation } from "./form-section-location";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddAssetFlowProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddAssetFlow({ onSuccess, onCancel }: AddAssetFlowProps) {
  const {
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
  } = useInventoryDialog(onSuccess);

  // ดึงค่า selectedProduct จาก form state โดยตรง
  const selectedProduct = products.find(
    (p) => p.id === form.watch("productId")
  );

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <Form {...form}>
        <form
          id="main-asset-form"
          onSubmit={form.handleSubmit(onAssetSubmit)}
          className="flex flex-col h-full"
        >
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Package className="w-5 h-5 text-ku-green" />
                    {view === "SELECT_PRODUCT"
                      ? "1. เลือกประเภทครุภัณฑ์"
                      : "สร้างประเภทครุภัณฑ์ใหม่"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {view === "SELECT_PRODUCT" ? (
                    <ProductSelectionComboBox
                      products={products}
                      onSelect={handleProductSelect}
                      onAddNew={handleSwitchToCreate}
                    />
                  ) : (
                    <CreateProductForm
                      initialName={newProductName}
                      onSuccess={handleProductCreated}
                      onCancel={() => setView("SELECT_PRODUCT")}
                    />
                  )}
                </CardContent>
              </Card>

              {view === "SELECT_PRODUCT" && selectedProduct && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Info className="w-5 h-5 text-blue-600" />
                      2. กรอกข้อมูลเฉพาะของครุภัณฑ์
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedProduct.trackingMethod === "BY_ITEM" && (
                      <FormSectionDurable control={form.control} />
                    )}
                    {selectedProduct.trackingMethod === "BY_QUANTITY" && (
                      <FormSectionConsumable
                        control={form.control}
                        currentStock={0}
                      />
                    )}
                    <FormSectionLocation control={form.control} />
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          {view === "SELECT_PRODUCT" && (
            <div className="border-t bg-white px-6 py-4 flex justify-end gap-3 flex-shrink-0">
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
                disabled={isSubmitting || !form.watch("productId")}
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                เพิ่มเข้าคลัง
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
