import { Product } from './product.types';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  requestPeriod: RequestPeriod;
  purpose: string;
  notes?: string;
  priority: RequestPriority;
  addedAt: string;
}

export interface RequestPeriod {
  startDate: string;
  endDate: string;
  duration: number; // in days
  isFlexible: boolean;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  metadata: CartMetadata;
}

export interface CartMetadata {
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface RequestSubmission {
  cartId: string;
  requesterInfo: RequesterInfo;
  generalPurpose: string;
  deliveryInfo: DeliveryInfo;
  attachments?: File[];
  urgency: RequestPriority;
}

export interface RequesterInfo {
  name: string;
  email: string;
  department: string;
  phone?: string;
}

export interface DeliveryInfo {
  location: string;
  preferredTime?: string;
  specialInstructions?: string;
}

export type RequestPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';