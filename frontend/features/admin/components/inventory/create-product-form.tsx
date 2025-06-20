"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductSchema,
  CreateProductFormData,
} from "../../schemas/product-schema";
import { Product } from "@/types/inventory";
import { ProductService } from "../../services/product-service";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface CreateProductFormProps {
  initialName: string;
  onSuccess: (newProduct: Product) => void;
  onCancel: () => void;
}

export function CreateProductForm({
  initialName,
  onSuccess,
  onCancel,
}: CreateProductFormProps) {
  const { toast } = useToast();
  const form = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: initialName,
      brand: "",
      productModel: "",
      trackingMethod: "BY_ITEM",
      categoryId: undefined,
      description: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: CreateProductFormData) => {
    try {
      const newProduct = await ProductService.createProduct(data);
      toast({
        title: "สร้างประเภทใหม่สำเร็จ!",
        description: `"${newProduct.name}" ได้ถูกเพิ่มในแคตตาล็อกแล้ว`,
      });
      onSuccess(newProduct);
    } catch (error: unknown) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      {/* ⭐️ แก้ไขโดยการเอา <form> ที่ซ้อนกันออก และใช้ form.handleSubmit ในปุ่มแทน */}
      <div className="p-1">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          สร้างประเภทครุภัณฑ์ใหม่
        </h3>
        <div className="space-y-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อประเภท *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="brand"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ยี่ห้อ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ⭐ นี่คือส่วนที่แก้ไข Syntax ให้ถูกต้อง */}
            <FormField
              name="productModel"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รุ่น</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>คำอธิบาย</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="trackingMethod"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>วิธีการติดตาม *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="BY_ITEM" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        ติดตามรายชิ้น (ครุภัณฑ์)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="BY_QUANTITY" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        ติดตามเป็นจำนวน (วัสดุสิ้นเปลือง)
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              บันทึกประเภท
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
}
