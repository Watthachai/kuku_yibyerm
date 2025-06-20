"use client";

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
const BUILDINGS = [
  { value: "อาคาร 1", label: "อาคาร 1" },
  { value: "อาคารสารสนเทศ", label: "อาคารสารสนเทศ" },
];

interface FormSectionLocationProps {
  control: Control<AssetFormData>;
}

export function FormSectionLocation({ control }: FormSectionLocationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
      <FormField
        control={control}
        name="locationBuilding"
        render={({ field }) => (
          <FormItem>
            <FormLabel>อาคารที่จัดเก็บ *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกอาคาร" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BUILDINGS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="locationRoom"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ห้องที่จัดเก็บ *</FormLabel>
            <FormControl>
              <Input
                placeholder="เช่น ห้องพัสดุ หรือ 101"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
