"use client";

import { useState, useEffect } from "react";
import {
  BorrowRequest,
  RequestStatus,
  RequestStats,
} from "../types/request.types";
import { RequestService, RequestResponse } from "../services/request-service";

export function useMobileRequests() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapRequestResponseToBorrowRequest = (
    resp: RequestResponse
  ): BorrowRequest => {
    return {
      id: String(resp.id),
      requestNumber: resp.request_number,
      user: {
        id: resp.user ? String(resp.user.id) : "",
        name: resp.user?.name || "",
        email: resp.user?.email || "",
        department: "", // Not available in response
      },
      items: resp.items.map((item, idx) => ({
        id: String(idx), // No id in response, use index
        product: {
          id: String(item.product.id),
          name: item.product.name,
          code: "", // Not available in response
          imageUrl: undefined, // Not available in response
        },
        quantity: item.quantity,
        purpose: resp.purpose,
        notes: resp.notes,
      })),
      purpose: resp.purpose,
      requestDate: resp.request_date,
      expectedStartDate: "", // Not available in response
      expectedEndDate: "", // Not available in response
      status: resp.status as RequestStatus,
      adminNote: undefined,
      approvedBy: undefined,
      rejectedBy: undefined,
      createdAt: resp.created_at,
      updatedAt: resp.created_at,
    };
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RequestService.getMyRequests();
      setRequests(data.map(mapRequestResponseToBorrowRequest));
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const getRequestsByStatus = (status?: RequestStatus) => {
    if (!status) return requests;
    return requests.filter((request) => request.status === status);
  };

  const getRequestStats = (): RequestStats => {
    return requests.reduce(
      (stats, request) => {
        const status = request.status.toLowerCase() as keyof RequestStats;
        stats[status] = (stats[status] || 0) + 1;
        return stats;
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0,
        borrowed: 0,
        returned: 0,
        overdue: 0,
      }
    );
  };

  const cancelRequest = async (requestId: string) => {
    try {
      await RequestService.cancelRequest(requestId);
      await loadRequests(); // Refresh list
    } catch (err) {
      throw err;
    }
  };

  // Helper to map Partial<BorrowRequest> to Partial<RequestResponse>
  function mapBorrowRequestToRequestResponse(
    updates: Partial<BorrowRequest>
  ): Partial<RequestResponse> {
    const mapped: Partial<RequestResponse> = {};
    if (updates.purpose !== undefined) mapped.purpose = updates.purpose;
    if (updates.status !== undefined) mapped.status = updates.status;
    // Removed notes mapping, as notes is not a direct property of BorrowRequest
    // Add more fields as needed
    return mapped;
  }

  const editRequest = async (
    requestId: string,
    updates: Partial<BorrowRequest>
  ) => {
    try {
      await RequestService.updateRequest(
        requestId,
        mapBorrowRequestToRequestResponse(updates)
      );
      await loadRequests(); // Refresh list
    } catch (err) {
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    loadRequests,
    getRequestsByStatus,
    getRequestStats,
    cancelRequest,
    editRequest,
  };
}
