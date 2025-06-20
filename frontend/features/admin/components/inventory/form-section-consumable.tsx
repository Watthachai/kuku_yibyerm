import { Control, useWatch } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AssetFormData } from "@/types/inventory";

interface FormSectionConsumableProps {
  control: Control<AssetFormData>;
  currentStock: number; // รับค่าสต็อกปัจจุบันมาแสดง
}

export function FormSectionConsumable({
  control,
  currentStock,
}: FormSectionConsumableProps) {
  const addQuantity = useWatch({ control, name: "quantity" });

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="text-sm">
        <span className="text-gray-600">สต็อกปัจจุบัน: </span>
        <span className="font-bold text-lg">
          {currentStock.toLocaleString()}
        </span>{" "}
        ชิ้น
      </div>
      <FormField
        control={control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>จำนวนที่จัดซื้อเพิ่ม *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="0"
                {...field}
                onChange={(event) =>
                  field.onChange(parseInt(event.target.value) || 0)
                }
              />
            </FormControl>
            {addQuantity && addQuantity > 0 && (
              <p className="text-sm text-green-600 mt-1">
                → สต็อกใหม่จะเป็น:{" "}
                {(currentStock + addQuantity).toLocaleString()} ชิ้น
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
