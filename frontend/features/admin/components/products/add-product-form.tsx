"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductSchema,
  CreateProductFormData,
} from "../../schemas/product-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ProductService } from "../../services/product-service";
import { CategoryService, Category } from "../../services/category-service";
import { Loader2, Package, Hash, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AddProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddProductForm({ onSuccess, onCancel }: AddProductFormProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const form = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      product_model: "",
      stock: 0,
      min_stock: 5,
      unit: "ชิ้น",
    },
  });

  const { isSubmitting } = form.formState;

  // โหลดหมวดหมู่
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await CategoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดหมวดหมู่ได้",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [toast]);

  async function onSubmit(data: CreateProductFormData) {
    try {
      // ⭐ แปลงข้อมูลให้ตรงกับ API
      const productData = {
        name: data.name,
        description: data.description,
        categoryId: data.category_id,
        brand: data.brand,
        productModel: data.product_model,
        stock: data.stock,
        minStock: data.min_stock || 0,
        unit: data.unit || "ชิ้น",
      };

      await ProductService.createProduct(productData);

      toast({
        title: "เพิ่มสินค้าสำเร็จ! 🎉",
        description: `"${data.name}" ถูกเพิ่มเข้าระบบแล้ว`,
      });

      onSuccess();
    } catch (error: unknown) {
      console.error("Error creating product:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error ? error.message : "ไม่สามารถเพิ่มสินค้าได้",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ข้อมูลพื้นฐาน */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              ข้อมูลพื้นฐาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อสินค้า / ครุภัณฑ์ *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="เช่น เครื่องคอมพิวเตอร์ตั้งโต๊ะ Dell OptiPlex"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียด</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="อธิบายรายละเอียด สเปค หรือคุณสมบัติของสินค้า"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="category_id"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมวดหมู่ *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingCategories
                              ? "กำลังโหลด..."
                              : "เลือกหมวดหมู่"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem
                          key={category.id.toString()}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* รายละเอียดเพิ่มเติม */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Settings className="w-5 h-5 mr-2 text-orange-600" />
              รายละเอียดเพิ่มเติม
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="brand"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ยี่ห้อ / ผู้ผลิต</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น Dell, HP, Canon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="product_model"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รุ่น / Model</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="เช่น OptiPlex 7090, LaserJet Pro"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* จำนวนและหน่วย */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Hash className="w-5 h-5 mr-2 text-green-600" />
              จำนวนและหน่วย
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="stock"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนคงเหลือ *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? 0 : parseInt(value) || 0
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="min_stock"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนขั้นต่ำ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="5"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? 0 : parseInt(value) || 0
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="unit"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หน่วยนับ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue="ชิ้น">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกหน่วย" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ชิ้น">ชิ้น</SelectItem>
                        <SelectItem value="เครื่อง">เครื่อง</SelectItem>
                        <SelectItem value="อัน">อัน</SelectItem>
                        <SelectItem value="ตัว">ตัว</SelectItem>
                        <SelectItem value="กล่อง">กล่อง</SelectItem>
                        <SelectItem value="แพ็ค">แพ็ค</SelectItem>
                        <SelectItem value="ห่อ">ห่อ</SelectItem>
                        <SelectItem value="แผ่น">แผ่น</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stock Warning */}
            {form.watch("stock") <= (form.watch("min_stock") || 0) &&
              form.watch("stock") > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ จำนวนคงเหลือต่ำกว่าหรือเท่ากับจำนวนขั้นต่ำ
                    ระบบจะแจ้งเตือนเมื่อสต็อกใกล้หมด
                  </p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
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
            className="bg-ku-green hover:bg-ku-green-dark"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            เพิ่มสินค้า
          </Button>
        </div>
      </form>
    </Form>
  );
}
