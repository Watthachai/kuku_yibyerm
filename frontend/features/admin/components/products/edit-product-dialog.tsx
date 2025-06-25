"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryService } from "../../services/category-service";
import { ProductManagementService } from "../../services/product-management-service";
import { Product, UpdateProductRequest } from "@/types/product";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";

// ⭐ Validation Schema
const editProductSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  brand: z.string().optional(),
  productModel: z.string().optional(),
  stock: z.number().min(0, "จำนวนสต็อกต้องไม่ติดลบ"),
  minStock: z.number().min(0, "สต็อกขั้นต่ำต้องไม่ติดลบ"),
  unit: z.string().min(1, "กรุณากรอกหน่วยนับ"),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: EditProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      brand: "",
      productModel: "",
      stock: 0,
      minStock: 0,
      unit: "ชิ้น",
    },
  });

  // โหลด categories และ set ค่าเริ่มต้น
  useEffect(() => {
    if (open) {
      loadCategories();
      if (product) {
        form.reset({
          name: product.name,
          description: product.description || "",
          categoryId: product.category?.id || "",
          brand: product.brand || "",
          productModel: product.productModel || "",
          stock: product.stock,
          minStock: product.minStock,
          unit: product.unit,
        });
      }
    }
  }, [open, product, form]);

  const loadCategories = async () => {
    try {
      const data = await CategoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("ไม่สามารถโหลดหมวดหมู่ได้");
    }
  };

  const onSubmit = async (data: EditProductFormData) => {
    if (!product) return;

    try {
      setLoading(true);

      const updateData: UpdateProductRequest = {
        id: product.id,
        name: data.name,
        description: data.description,
        categoryId: parseInt(data.categoryId),
        brand: data.brand,
        productModel: data.productModel,
        stock: data.stock,
        minStock: data.minStock,
        unit: data.unit,
      };

      await ProductManagementService.updateProduct(product.id, updateData);

      toast.success("อัปเดตสินค้าสำเร็จ 🎉", {
        description: `${data.name} ถูกอัปเดตเรียบร้อยแล้ว`,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("ไม่สามารถอัปเดตสินค้าได้", {
        description:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`
          max-w-6xl 
          w-[95vw] 
          max-h-[95vh] 
          p-0 
          overflow-hidden
          sm:max-w-4xl 
          lg:max-w-6xl 
          xl:max-w-7xl
        `}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            แก้ไขข้อมูลสินค้า
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            แก้ไขข้อมูลสินค้า: {product?.name}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">ข้อมูลพื้นฐาน</h3>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อสินค้า *</FormLabel>
                        <FormControl>
                          <Input placeholder="กรอกชื่อสินค้า" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>คำอธิบาย</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>หมวดหมู่ *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกหมวดหมู่" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">รายละเอียดสินค้า</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ยี่ห้อ</FormLabel>
                          <FormControl>
                            <Input placeholder="ยี่ห้อสินค้า" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="productModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>รุ่น</FormLabel>
                          <FormControl>
                            <Input placeholder="รุ่นสินค้า" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Stock Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">ข้อมูลสต็อก</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>จำนวนปัจจุบัน *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>สต็อกขั้นต่ำ *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>หน่วยนับ *</FormLabel>
                          <FormControl>
                            <Input placeholder="ชิ้น, กล่อง, ชุด" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Stock Alert */}
                  {form.watch("stock") <= form.watch("minStock") && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ จำนวนสต็อกปัจจุบันต่ำกว่าหรือเท่ากับสต็อกขั้นต่ำ
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
