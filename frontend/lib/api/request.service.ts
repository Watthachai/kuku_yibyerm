import { apiClient } from './client';

export interface CreateRequestData {
  purpose: string;
  notes?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  items: {
    productId: string;
    quantity: number;
    purpose?: string;
    notes?: string;
  }[];
}

export interface BorrowRequest {
  id: string;
  requestNumber: string;
  purpose: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED' | 'COMPLETED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  requestDate: string;
  requiredDate: string;
  approvedDate?: string;
  issuedDate?: string;
  completedDate?: string;
  adminNote?: string;
  rejectionReason?: string;
  user: {
    id: string;
    name: string;
    email: string;
    department: {
      id: string;
      name: string;
    };
  };
  items: {
    id: string;
    quantity: number;
    purpose?: string;
    notes?: string;
    status: string;
    issuedQty: number;
    product: {
      id: string;
      name: string;
      code: string;
      category: {
        id: string;
        name: string;
        icon: string;
      };
    };
  }[];
}

export interface RequestFilters {
  status?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}

export interface RequestResponse {
  requests: BorrowRequest[];
  total: number;
  page: number;
  limit: number;
}

export class RequestService {
  static async createRequest(data: CreateRequestData): Promise<BorrowRequest> {
    const requestData = {
      purpose: data.purpose,
      notes: data.notes,
      priority: data.priority || 'NORMAL',
      items: data.items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        purpose: item.purpose,
        notes: item.notes,
      })),
    };

    const response = await apiClient.post('/requests', requestData);
    return response.data.request;
  }

  static async getMyRequests(filters: RequestFilters = {}): Promise<RequestResponse> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/requests/my?${params.toString()}`);
    return response.data;
  }

  static async getAllRequests(filters: RequestFilters = {}): Promise<RequestResponse> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.departmentId) params.append('department_id', filters.departmentId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/admin/requests?${params.toString()}`);
    return response.data;
  }

  static async approveRequest(requestId: string, notes?: string): Promise<void> {
    await apiClient.put(`/admin/requests/${requestId}/approve`, {
      notes: notes || '',
    });
  }

  static async rejectRequest(requestId: string, reason: string): Promise<void> {
    await apiClient.put(`/admin/requests/${requestId}/reject`, {
      reason,
    });
  }
}