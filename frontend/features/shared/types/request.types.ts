export type RequestStatus =
  | "PENDING" // รออนุมัติ
  | "APPROVED" // อนุมัติแล้ว
  | "REJECTED" // ปฏิเสธ
  | "ISSUED" // เบิกออกแล้ว (เสร็จสิ้น)
  | "COMPLETED"; // เสร็จสิ้น (เหมือน ISSUED)

export interface User {
  id: string;
  name: string;
  email: string;
  department?: Department; // <-- แก้ไขจาก string เป็น Department
}

export interface Department {
  id: number;
  name: string;
  code?: string;
  faculty?: string;
}

export interface Product {
  id: string;
  name: string;
  code?: string;
  category?: string;
}

export interface RequestItem {
  id: string;
  product: Product;
  quantity: number;
  purpose?: string;
  notes?: string;
}

export interface BorrowRequest {
  id: string;
  requestNumber?: string;
  user: User;
  items: RequestItem[];
  purpose: string;
  notes?: string;
  status: RequestStatus;
  requestDate: string;
  approvedDate?: string;
  issuedDate?: string;
  completedDate?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;

  // Admin info (ถ้ามี)
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
}

export interface CreateBorrowRequest {
  purpose: string;
  notes?: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface ApprovalAction {
  action: "APPROVE" | "REJECT";
  notes?: string;
}
