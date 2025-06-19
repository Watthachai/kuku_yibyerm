import { getAuthHeadersForFormData } from "@/lib/api";
import { AssetFormData } from "@/types/inventory";

export class AssetService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // ฟังก์ชันสำหรับสร้าง Asset ใหม่
  static async createAsset(
    data: AssetFormData
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const headers = await getAuthHeadersForFormData();

    // ใช้ FormData เพื่อจัดการการอัปโหลดไฟล์รูปภาพ
    const formData = new FormData();

    // แปลง object 'data' ให้เป็น FormData
    // Object.entries(data) จะไม่ทำงานกับ File object เราต้องจัดการเอง
    formData.append("productId", data.productId.toString());
    formData.append("assetCode", data.assetCode);
    formData.append("status", data.status);
    formData.append("locationBuilding", data.locationBuilding);
    formData.append("locationRoom", data.locationRoom);

    if (data.serialNumber) formData.append("serialNumber", data.serialNumber);
    if (data.notes) formData.append("notes", data.notes);
    if (data.purchaseDate)
      formData.append("purchaseDate", data.purchaseDate.toISOString());
    if (data.purchasePrice)
      formData.append("purchasePrice", data.purchasePrice.toString());

    // จัดการไฟล์รูปภาพ
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
      throw new Error(errorData.message || "Failed to create asset");
    }

    return response.json();
  }
}
