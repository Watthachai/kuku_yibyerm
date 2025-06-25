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
import {
  Loader2,
  Package,
  Hash,
  Settings,
  ImageIcon,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedImageUpload } from "@/components/ui/advanced-image-upload";
import {
  translateProductNameToSearchTerm,
  searchImagesFromUnsplash,
  FALLBACK_IMAGES,
  UNSPLASH_ACCESS_KEY,
} from "../../utils/image-search";

interface AddProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddProductForm({ onSuccess, onCancel }: AddProductFormProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // ⭐ เพิ่ม state สำหรับรูปภาพ
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

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

  // ⭐ ฟังก์ชันค้นหารูปภาพแนะนำจาก Unsplash
  const searchSuggestedImages = async (productName: string) => {
    if (!productName || productName.length < 3) return;

    try {
      setIsLoadingSuggestions(true);

      // แปลงชื่อสินค้าเป็นคำค้นหาภาษาอังกฤษ
      const searchTerm = translateProductNameToSearchTerm(productName);
      console.log("🔍 Search term:", searchTerm);

      // ค้นหารูปภาพจาก Unsplash
      const imageUrls = await searchImagesFromUnsplash(
        searchTerm,
        UNSPLASH_ACCESS_KEY
      );
      setSuggestedImages(imageUrls);
    } catch (error) {
      console.error("Failed to fetch suggested images:", error);
      // ใช้รูปภาพ placeholder แทน
      setSuggestedImages(FALLBACK_IMAGES);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

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
        category_id: data.category_id,
        brand: data.brand,
        product_model: data.product_model,
        stock: data.stock,
        min_stock: data.min_stock || 0,
        unit: data.unit || "ชิ้น",

        // ⭐ แก้ไข: ใช้ image_url ตาม backend DTO
        image_url: imageUrl || undefined,
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
    <div className="flex flex-col h-full">
      {/* ⭐ Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ⭐ Grid Layout สำหรับ Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ⭐ ซ้าย: รูปภาพ (1/3) */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                    รูปภาพสินค้า
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AdvancedImageUpload
                    value={imageUrl}
                    onChange={(url: string | null) =>
                      setImageUrl(url || undefined)
                    }
                    placeholder="อัปโหลดรูปภาพสินค้า"
                    showProgress={true}
                    showOptimizationInfo={true}
                    validationConfig={{
                      maxFileSize: 5 * 1024 * 1024, // 5MB
                      maxWidth: 1920,
                      maxHeight: 1080,
                    }}
                    optimizationConfig={{
                      autoResize: true,
                      maxWidth: 1920,
                      maxHeight: 1080,
                      quality: 85,
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    รูปภาพจะช่วยให้ผู้ใช้เข้าใจสินค้าได้ดีขึ้น (ไม่บังคับ)
                  </p>

                  {/* ⭐ รูปภาพแนะนำ */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        รูปภาพแนะนำ
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const productName = form.getValues("name");
                          if (productName) {
                            searchSuggestedImages(productName);
                          } else {
                            toast({
                              title: "กรุณากรอกชื่อสินค้าก่อน",
                              description:
                                "ระบบจะค้นหารูปภาพที่เหมาะสมตามชื่อสินค้า",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={isLoadingSuggestions}
                        className="text-xs"
                      >
                        {isLoadingSuggestions ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3 mr-1" />
                        )}
                        ค้นหา
                      </Button>
                    </div>

                    {suggestedImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {suggestedImages.map((imgUrl, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setImageUrl(imgUrl)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                              imageUrl === imgUrl
                                ? "border-ku-green ring-2 ring-ku-green/20"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`แนะนำ ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {imageUrl === imgUrl && (
                              <div className="absolute top-1 right-1 bg-ku-green text-white rounded-full p-1">
                                <Sparkles className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {suggestedImages.length === 0 && !isLoadingSuggestions && (
                      <p className="text-xs text-gray-400 text-center py-4">
                        กรอกชื่อสินค้าแล้วคลิก &quot;ค้นหา&quot;
                        เพื่อดูรูปภาพแนะนำ
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ⭐ ขวา: ข้อมูลสินค้า (2/3) */}
            <div className="lg:col-span-2 space-y-6">
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
                            className="text-base h-11" // ⭐ เพิ่มความสูง
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
                            className="min-h-[120px] text-base resize-none" // ⭐ ปรับความสูงและขนาดข้อความ
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
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          disabled={isLoadingCategories}
                        >
                          <FormControl>
                            <SelectTrigger className="text-base h-11">
                              {" "}
                              {/* ⭐ เพิ่มความสูง */}
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
                                className="text-base py-3" // ⭐ เพิ่ม padding
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

              {/* ⭐ Grid Layout สำหรับ Sections ที่เหลือ */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* รายละเอียดเพิ่มเติม */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-base">
                      <Settings className="w-4 h-4 mr-2 text-orange-600" />
                      รายละเอียดเพิ่มเติม
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      name="brand"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ยี่ห้อ / ผู้ผลิต</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="เช่น Dell, HP, Canon"
                              className="text-base h-11"
                              {...field}
                            />
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
                              className="text-base h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* จำนวนและหน่วย */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-base">
                      <Hash className="w-4 h-4 mr-2 text-green-600" />
                      จำนวนและหน่วย
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                              className="text-base h-11"
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
                              className="text-base h-11"
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue="ชิ้น"
                          >
                            <FormControl>
                              <SelectTrigger className="text-base h-11">
                                <SelectValue placeholder="เลือกหน่วย" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem
                                value="ชิ้น"
                                className="text-base py-3"
                              >
                                ชิ้น
                              </SelectItem>
                              <SelectItem
                                value="เครื่อง"
                                className="text-base py-3"
                              >
                                เครื่อง
                              </SelectItem>
                              <SelectItem
                                value="อัน"
                                className="text-base py-3"
                              >
                                อัน
                              </SelectItem>
                              <SelectItem
                                value="ตัว"
                                className="text-base py-3"
                              >
                                ตัว
                              </SelectItem>
                              <SelectItem
                                value="กล่อง"
                                className="text-base py-3"
                              >
                                กล่อง
                              </SelectItem>
                              <SelectItem
                                value="แพ็ค"
                                className="text-base py-3"
                              >
                                แพ็ค
                              </SelectItem>
                              <SelectItem
                                value="ห่อ"
                                className="text-base py-3"
                              >
                                ห่อ
                              </SelectItem>
                              <SelectItem
                                value="แผ่น"
                                className="text-base py-3"
                              >
                                แผ่น
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
              </div>
            </div>
          </div>

          {/* ⭐ Fixed Bottom Actions - ใน Dialog */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-8 h-11 text-base border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-ku-green hover:bg-ku-green-dark px-8 h-11 text-base font-medium text-white"
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                เพิ่มสินค้า
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
