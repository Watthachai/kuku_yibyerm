import { getAuthHeadersForFormData } from "@/lib/api";
import { AssetFormData } from "@/types/inventory";

export class AssetService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  static async createAsset(
    data: AssetFormData
  ): Promise<{ id: string; message: string }> {
    const headers = await getAuthHeadersForFormData();
    const formData = new FormData();

    // ⭐ แก้ไข Key ทั้งหมดในนี้ให้เป็น snake_case
    formData.append("product_id", data.productId.toString());
    formData.append("asset_code", data.assetCode);
    formData.append("status", data.status);
    formData.append("location_building", data.locationBuilding);
    formData.append("location_room", data.locationRoom);

    if (data.serialNumber) {
      formData.append("serial_number", data.serialNumber);
    }
    if (data.notes) {
      formData.append("notes", data.notes);
    }
    if (data.purchaseDate) {
      // ตรวจสอบให้แน่ใจว่า format ของ date ถูกต้องตามที่ backend ต้องการ
      formData.append("purchase_date", data.purchaseDate.toISOString());
    }
    if (data.purchasePrice) {
      formData.append("purchase_price", data.purchasePrice.toString());
    }

    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await fetch(`${this.baseUrl}/api/v1/assets`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      // โยน Error พร้อม message จาก backend เพื่อให้ debug ง่ายขึ้น
      throw new Error(errorData.message || "Failed to create asset");
    }

    return response.json();
  }
}
