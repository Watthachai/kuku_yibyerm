export interface BorrowRequest {
  id: string;
  requestNumber: string;
  user: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  items: RequestItem[];
  purpose: string;
  requestDate: string;
  expectedStartDate: string;
  expectedEndDate: string;
  status: RequestStatus;
  adminNote?: string;
  approvedBy?: {
    id: string;
    name: string;
    approvedAt: string;
  };
  rejectedBy?: {
    id: string;
    name: string;
    rejectedAt: string;
    reason: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RequestItem {
  id: string;
  product: {
    id: string;
    name: string;
    code: string;
    imageUrl?: string;
  };
  quantity: number;
  purpose: string;
  notes?: string;
}

export type RequestStatus = 
  | "PENDING"     // รออนุมัติ
  | "APPROVED"    // อนุมัติแล้ว
  | "REJECTED"    // ปฏิเสธ
  | "BORROWED"    // กำลังยืม
  | "RETURNED"    // คืนแล้ว
  | "OVERDUE";    // เกินกำหนด

export interface CreateBorrowRequest {
  items: {
    productId: string;
    quantity: number;
    purpose: string;
    notes?: string;
  }[];
  generalPurpose: string;
  expectedStartDate: string;
  expectedEndDate: string;
}

export interface RequestStats {
  pending: number;
  approved: number;
  rejected: number;
  borrowed: number;
  returned: number;
  overdue: number;
}