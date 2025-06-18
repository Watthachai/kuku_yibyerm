"use client";

import { useState, useEffect } from 'react';
import { BorrowRequest, RequestStatus, RequestStats } from '../types/request.types';
import { RequestService } from '../services/request.service';

export function useMobileRequests() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RequestService.getMyRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const getRequestsByStatus = (status?: RequestStatus) => {
    if (!status) return requests;
    return requests.filter(request => request.status === status);
  };

  const getRequestStats = (): RequestStats => {
    return requests.reduce((stats, request) => {
      const status = request.status.toLowerCase() as keyof RequestStats;
      stats[status] = (stats[status] || 0) + 1;
      return stats;
    }, {
      pending: 0,
      approved: 0,
      rejected: 0,
      borrowed: 0,
      returned: 0,
      overdue: 0,
    });
  };

  const cancelRequest = async (requestId: string) => {
    try {
      await RequestService.cancelRequest(requestId);
      await loadRequests(); // Refresh list
    } catch (err) {
      throw err;
    }
  };

  const editRequest = async (requestId: string, updates: Partial<BorrowRequest>) => {
    try {
      await RequestService.updateRequest(requestId, updates);
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