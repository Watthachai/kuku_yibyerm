import { BorrowRequest, CreateBorrowRequest } from '../types/request.types';

class RequestService {
  private baseUrl = '/api/requests';

  async getMyRequests(): Promise<BorrowRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/my-requests`);
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      return await response.json();
    } catch (error) {
      console.error('RequestService.getMyRequests error:', error);
      // Return mock data for now
      return this.getMockRequests();
    }
  }

  async createRequest(requestData: CreateBorrowRequest): Promise<BorrowRequest> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('RequestService.createRequest error:', error);
      throw error;
    }
  }

  async cancelRequest(requestId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${requestId}/cancel`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }
    } catch (error) {
      console.error('RequestService.cancelRequest error:', error);
      throw error;
    }
  }

  async updateRequest(requestId: string, updates: Partial<BorrowRequest>): Promise<BorrowRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('RequestService.updateRequest error:', error);
      throw error;
    }
  }

  private getMockRequests(): BorrowRequest[] {
    return [
      {
        id: '1',
        requestNumber: 'REQ-2025-001',
        user: {
          id: 'u1',
          name: 'นาย สมชาย ใจดี',
          email: 'somchai@ku.ac.th',
          department: 'คณะเกษตร',
        },
        items: [
          {
            id: 'i1',
            product: {
              id: 'p1',
              name: 'เครื่องฉายภาพ Epson EB-X41',
              code: 'EP001-2024',
            },
            quantity: 1,
            purpose: 'ใช้ในการสอน',
          },
        ],
        purpose: 'การสอนในรายวิชา เกษตรเบื้องต้น',
        requestDate: new Date().toISOString(),
        expectedStartDate: new Date().toISOString(),
        expectedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

export const requestService = new RequestService();
export { RequestService };