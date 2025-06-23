"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Package,
  Calendar,
  FileText,
  RefreshCw,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { RequestService } from "../../services/request-service";

interface Request {
  id: number;
  request_number: string;
  status: string;
  purpose: string;
  request_date: string;
  items: Array<{
    quantity: number;
    product: {
      id: number;
      name: string;
    };
  }>;
}

interface ApiResponse {
  requests: Request[];
}

export function MyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await RequestService.getMyRequests();

      if (Array.isArray(data)) {
        setRequests(data);
      } else if (data && typeof data === "object" && "requests" in data) {
        const apiResponse = data as ApiResponse;
        if (Array.isArray(apiResponse.requests)) {
          setRequests(apiResponse.requests);
        } else {
          setRequests([]);
        }
      } else {
        setRequests([]);
      }
      setError(null);
    } catch (error) {
      console.error("❌ Failed to load requests:", error);
      setError(
        error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้"
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500";
      case "APPROVED":
        return "bg-emerald-500";
      case "REJECTED":
        return "bg-red-500";
      case "ISSUED":
        return "bg-blue-500";
      case "COMPLETED":
        return "bg-slate-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "รอดำเนินการ";
      case "APPROVED":
        return "อนุมัติแล้ว";
      case "REJECTED":
        return "ไม่อนุมัติ";
      case "ISSUED":
        return "เบิกแล้ว";
      case "COMPLETED":
        return "เสร็จสิ้น";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalItems = (
    items: Array<{ quantity: number; product: { id: number; name: string } }>
  ) => {
    return items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-lg font-semibold text-gray-900">
              คำขอเบิกของฉัน
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm font-medium">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-lg font-semibold text-gray-900">
              คำขอเบิกของฉัน
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {error}
            </p>
            <Button
              onClick={loadRequests}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium"
            >
              ลองใหม่
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(requests) || requests.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-lg font-semibold text-gray-900">
              คำขอเบิกของฉัน
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              ยังไม่มีคำขอเบิก
            </h3>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              เมื่อคุณส่งคำขอเบิกครุภัณฑ์แล้ว จะแสดงรายการและสถานะที่นี่
            </p>
            <Button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium"
            >
              เลือกสินค้า
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header with Stats */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                คำขอเบิกของฉัน
              </h1>
              <p className="text-sm text-gray-600">
                ทั้งหมด{" "}
                <span className="font-medium text-blue-600">
                  {requests.length}
                </span>{" "}
                รายการ
              </p>
            </div>
            <Button
              onClick={loadRequests}
              variant="ghost"
              size="sm"
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2.5 rounded-lg"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="px-4 py-4 space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-3">
                  <h3 className="font-semibold text-gray-900 text-base leading-6 mb-2">
                    {request.purpose}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    <span>{formatDate(request.request_date)}</span>
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{formatTime(request.request_date)}</span>
                  </div>
                </div>
                <div
                  className={`${getStatusColor(
                    request.status
                  )} text-white px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap`}
                >
                  {getStatusText(request.status)}
                </div>
              </div>

              {request.request_number && (
                <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                  <FileText className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 font-mono">
                    รหัส: {request.request_number}
                  </span>
                </div>
              )}
            </div>

            {/* Items Summary */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {Array.isArray(request.items) ? request.items.length : 0}{" "}
                      รายการ
                    </p>
                    <p className="text-xs text-gray-500">รายการที่ขอเบิก</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {getTotalItems(request.items)}
                  </p>
                  <p className="text-xs text-gray-500">ชิ้น</p>
                </div>
              </div>

              {/* Items Preview */}
              {Array.isArray(request.items) && request.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    รายละเอียด:
                  </p>
                  {request.items.slice(0, 2).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center flex-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700 truncate">
                          {item.product?.name || "ไม่ระบุ"}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600 ml-3">
                        {item.quantity} ชิ้น
                      </span>
                    </div>
                  ))}

                  {request.items.length > 2 && (
                    <div className="text-center py-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        และอีก {request.items.length - 2} รายการ
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {(!Array.isArray(request.items) ||
                request.items.length === 0) && (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">
                    ไม่มีรายการสินค้า
                  </span>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  สร้างเมื่อ {formatDate(request.request_date)}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
