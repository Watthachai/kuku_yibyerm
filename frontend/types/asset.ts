// types/asset.ts
export interface CreateAssetRequest {
  name: string;
  assetCode: string;
  status: string;
  locationBuilding: string;
  locationRoom: string;
  productId: number; // หรือ string ขึ้นอยู่กับ model ของคุณ
  serialNumber?: string;
  image?: File;
}
