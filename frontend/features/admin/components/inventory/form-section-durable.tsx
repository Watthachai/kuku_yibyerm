import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetFormData } from "@/types/inventory";

// สมมติว่ามี constants เหล่านี้อยู่
const INVENTORY_STATUSES = [
  { value: "AVAILABLE", label: "พร้อมใช้งาน" },
  { value: "IN_USE", label: "กำลังใช้งาน" },
  { value: "MAINTENANCE", label: "ซ่อมบำรุง" },
];

interface FormSectionDurableProps {
  control: Control<AssetFormData>;
}

export function FormSectionDurable({ control }: FormSectionDurableProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="assetCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รหัสครุภัณฑ์ *</FormLabel>
              <FormControl>
                <Input
                  placeholder="เช่น PROJ-2024-001"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="เลขซีเรียลจากผู้ผลิต"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>สถานะ *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {INVENTORY_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
