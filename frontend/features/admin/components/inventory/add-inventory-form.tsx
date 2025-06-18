"use client";

import { useEffect, useRef } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInventoryForm } from "@/features/admin/hooks/use-inventory-form";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CONDITIONS,
  INVENTORY_STATUSES,
  BUILDINGS,
  DEPARTMENTS,
} from "@/features/admin/constants/inventory";
import {
  Package,
  MapPin,
  DollarSign,
  Shield,
  Info,
  Calendar,
  Loader2,
  Image as ImageIcon,
  Plus,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddInventoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddInventoryForm({
  onSuccess,
  onCancel,
}: AddInventoryFormProps) {
  const {
    form,
    isSubmitting,
    onSubmit,
    handleCategoryChange,
    handleNameChange,
  } = useInventoryForm();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormSubmit = async (data: any) => {
    const success = await onSubmit(data);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Auto scroll to first error
  useEffect(() => {
    const subscription = form.watch(() => {
      const errors = form.formState.errors;
      if (Object.keys(errors).length > 0) {
        const firstErrorField = Object.keys(errors)[0];
        const element = formRef.current?.querySelector(
          `[name="${firstErrorField}"]`
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content - ต้องมี height ที่ชัดเจน */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
        <div className="px-6 py-6">
          <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(handleFormSubmit)}>
              {/* Two Column Layout for larger screens */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <Card className="overflow-hidden border-l-4 border-l-ku-green">
                    <CardHeader className="pb-4 bg-gradient-to-r from-ku-green/5 to-transparent">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-ku-green rounded-lg">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        ข้อมูลพื้นฐาน
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      <div className="grid gap-5 lg:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                ชื่อครุภัณฑ์ *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="เช่น เครื่องฉายภาพ LCD"
                                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-ku-green/20"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleNameChange(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                รหัสครุภัณฑ์ *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="เช่น ELE-LCD-001"
                                  className="font-mono h-11 transition-all duration-200 focus:ring-2 focus:ring-ku-green/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-sm text-gray-500">
                                💡 รหัสจะถูกสร้างอัตโนมัติหากไม่ระบุ
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-5 lg:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                หมวดหมู่ *
                              </FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleCategoryChange(value);
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {INVENTORY_CATEGORIES.map((category) => (
                                    <SelectItem
                                      key={category.value}
                                      value={category.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        {category.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="condition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                สภาพ *
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {INVENTORY_CONDITIONS.map((condition) => (
                                    <SelectItem
                                      key={condition.value}
                                      value={condition.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-3 h-3 rounded-full ${condition.color}`}
                                        />
                                        {condition.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                สถานะ *
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {INVENTORY_STATUSES.map((status) => (
                                    <SelectItem
                                      key={status.value}
                                      value={status.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-3 h-3 rounded-full ${status.color}`}
                                        />
                                        {status.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">
                              คำอธิบาย
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับครุภัณฑ์..."
                                className="resize-none min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-ku-green/20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Product Details */}
                  <Card className="overflow-hidden border-l-4 border-l-blue-500">
                    <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-transparent">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Info className="w-5 h-5 text-white" />
                        </div>
                        รายละเอียดสินค้า
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      <div className="grid gap-5 lg:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                ยี่ห้อ
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="เช่น Sony"
                                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                รุ่น
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="เช่น VPL-EX225"
                                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="serialNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                หมายเลขเครื่อง
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="เช่น SN123456789"
                                  className="font-mono h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Image Upload Section */}
                      <div>
                        <FormLabel className="text-base font-medium text-gray-700 mb-3 block">
                          รูปภาพครุภัณฑ์
                        </FormLabel>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group">
                          <ImageIcon className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mx-auto mb-4 transition-colors" />
                          <p className="text-gray-600 mb-2">
                            ลากไฟล์มาวางที่นี่ หรือ
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            เลือกไฟล์
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">
                            รองรับไฟล์ JPG, PNG, WebP ขนาดไม่เกิน 5MB
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Location */}
                  <Card className="overflow-hidden border-l-4 border-l-orange-500">
                    <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-transparent">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-orange-500 rounded-lg">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        ที่ตั้งและการจัดเก็บ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      <div className="grid gap-5 lg:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="building"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                อาคาร *
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="เลือกอาคาร" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {BUILDINGS.map((building) => (
                                    <SelectItem
                                      key={building.value}
                                      value={building.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {building.code}
                                        </span>
                                        {building.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="room"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                ห้อง *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="เช่น 101"
                                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                หน่วยงาน *
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="เลือกหน่วยงาน" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {DEPARTMENTS.map((dept) => (
                                    <SelectItem
                                      key={dept.value}
                                      value={dept.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {dept.code}
                                        </span>
                                        {dept.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* QR Code Generation */}
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg p-4 border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              📱 QR Code อัตโนมัติ
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              QR Code จะถูกสร้างอัตโนมัติเมื่อบันทึกครุภัณฑ์
                            </p>
                          </div>
                          <div className="w-16 h-16 bg-white border border-orange-200 rounded-lg flex items-center justify-center shadow-sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-orange-300 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Purchase Information */}
                  <Card className="overflow-hidden border-l-4 border-l-green-500">
                    <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-transparent">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        ข้อมูลการจัดซื้อ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      <div className="grid gap-5 lg:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="purchaseDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                วันที่จัดซื้อ
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="purchasePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                ราคา (บาท)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  step="0.01"
                                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || undefined
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="supplier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                ผู้จำหน่าย
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="เช่น บริษัท ABC จำกัด"
                                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
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

                  {/* Warranty */}
                  <Card className="overflow-hidden border-l-4 border-l-purple-500">
                    <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-transparent">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        การรับประกัน
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      <div className="grid gap-5 lg:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="warrantyStartDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                วันที่เริ่มรับประกัน
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="warrantyEndDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium text-gray-700">
                                วันที่สิ้นสุดรับประกัน
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="warrantyTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">
                              เงื่อนไขการรับประกัน
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="รายละเอียดเงื่อนไขการรับประกัน..."
                                className="min-h-[80px] resize-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Additional Information */}
                  <Card className="overflow-hidden border-l-4 border-l-gray-500">
                    <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-transparent">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-gray-500 rounded-lg">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        ข้อมูลเพิ่มเติม
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-gray-700">
                              หมายเหตุ
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="ข้อมูลเพิ่มเติมหรือหมายเหตุพิเศษ เช่น คำแนะนำในการใช้งาน ข้อควรระวัง หรือข้อมูลสำคัญอื่นๆ..."
                                className="min-h-[120px] resize-none transition-all duration-200 focus:ring-2 focus:ring-gray-500/20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Extra padding at bottom */}
              <div className="py-8"></div>
            </form>
          </Form>
        </div>
      </ScrollArea>

      {/* Scroll to Top Button */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="fixed bottom-20 right-6 z-10 rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white"
        onClick={scrollToTop}
      >
        <ChevronUp className="h-4 w-4" />
        <span className="sr-only">เลื่อนขึ้นด้านบน</span>
      </Button>

      {/* Fixed Footer */}
      <div className="border-t bg-white/95 backdrop-blur-sm px-6 py-4 flex justify-end gap-3 flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          size="lg"
          className="min-w-[100px]"
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-ku-green hover:bg-ku-green-dark min-w-[120px]"
          size="lg"
          onClick={form.handleSubmit(handleFormSubmit)}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSubmitting ? "กำลังบันทึก..." : "เพิ่มครุภัณฑ์"}
        </Button>
      </div>
    </div>
  );
}
