export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  subCategory?: string;
  description?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  supplier?: string;
  warranty?: {
    startDate: Date;
    endDate: Date;
    terms?: string;
  };
  location: {
    building: string;
    room: string;
    department: string;
  };
  condition: "NEW" | "GOOD" | "FAIR" | "POOR" | "DAMAGED";
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";
  images?: string[];
  tags?: string[];
  specifications?: Record<string, string>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type CreateInventoryItemData = Omit<
  InventoryItem,
  "id" | "createdAt" | "updatedAt" | "createdBy"
>;

export interface InventoryFormData {
  // Basic Information
  name: string;
  code: string;
  category: string;
  subCategory?: string;
  description?: string;

  // Product Details
  brand?: string;
  model?: string;
  serialNumber?: string;

  // Purchase Information
  purchaseDate?: string;
  purchasePrice?: number;
  supplier?: string;

  // Warranty
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyTerms?: string;

  // Location
  building: string;
  room: string;
  department: string;

  // Status
  condition: string;
  status: string;

  // Additional
  tags?: string[];
  specifications?: Record<string, string>;
  notes?: string;
}
