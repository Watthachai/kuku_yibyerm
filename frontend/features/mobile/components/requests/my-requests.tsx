"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Package,
  Calendar,
  FileText,
  RefreshCw,
  ChevronRight,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Zap,
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

type FilterStatus =
  | "ALL"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ISSUED"
  | "COMPLETED";

export function MyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");

  const statusFilters = [
    {
      key: "ALL" as FilterStatus,
      label: "ทั้งหมด",
      icon: Package,
      color: "from-gray-500 to-gray-600",
    },
    {
      key: "PENDING" as FilterStatus,
      label: "รอดำเนินการ",
      icon: Clock,
      color: "from-amber-500 to-amber-600",
    },
    {
      key: "APPROVED" as FilterStatus,
      label: "อนุมัติแล้ว",
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
    },
    {
      key: "REJECTED" as FilterStatus,
      label: "ไม่อนุมัติ",
      icon: XCircle,
      color: "from-red-500 to-red-600",
    },
    {
      key: "ISSUED" as FilterStatus,
      label: "เบิกแล้ว",
      icon: Zap,
      color: "from-blue-500 to-blue-600",
    },
    {
      key: "COMPLETED" as FilterStatus,
      label: "เสร็จสิ้น",
      icon: CheckCircle,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const filteredRequests = requests.filter(
    (request) => activeFilter === "ALL" || request.status === activeFilter
  );

  const getRequestsByStatus = (status: string) =>
    requests.filter((request) => request.status === status).length;

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">คำขอเบิกของฉัน</h1>
            <p className="text-sm text-gray-600">ตรวจสอบสถานะการเบิก</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
              <Package className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 text-lg font-medium">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">คำขอเบิกของฉัน</h1>
            <p className="text-sm text-gray-600">ตรวจสอบสถานะการเบิก</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-20 px-4">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl max-w-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                เกิดข้อผิดพลาด
              </h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {error}
              </p>
              <Button
                onClick={loadRequests}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                ลองใหม่
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!Array.isArray(requests) || requests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">คำขอเบิกของฉัน</h1>
            <p className="text-sm text-gray-600">ตรวจสอบสถานะการเบิก</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-20 px-4">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl max-w-sm">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                ยังไม่มีคำขอเบิก
              </h3>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                เมื่อคุณส่งคำขอเบิกครุภัณฑ์แล้ว จะแสดงรายการและสถานะที่นี่
              </p>
              <Button
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                เลือกสินค้า
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-16">
      {/* Modern Header with Stats */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                คำขอเบิกของฉัน
              </h1>
              <p className="text-sm text-gray-600">
                ทั้งหมด{" "}
                <span className="font-semibold text-blue-600">
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
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 p-2.5 rounded-xl backdrop-blur-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {statusFilters.map((filter) => {
              const Icon = filter.icon;
              const count =
                filter.key === "ALL"
                  ? requests.length
                  : getRequestsByStatus(filter.key);
              const isActive = activeFilter === filter.key;

              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${filter.color} text-white shadow-lg shadow-opacity-25`
                      : "bg-white/60 text-gray-600 hover:bg-white/80 backdrop-blur-sm"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {filter.label}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="px-4 py-6 space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ไม่พบคำขอในสถานะนี้
              </h3>
              <p className="text-gray-600 text-sm">
                {activeFilter === "ALL"
                  ? "ยังไม่มีคำขอเบิกใดๆ"
                  : `ไม่มีคำขอที่มีสถานะ "${
                      statusFilters.find((f) => f.key === activeFilter)?.label
                    }"`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100/50 relative">
                {/* Status Indicator - เปลี่ยนจากแถบเป็นจุดแสง */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                      statusFilters.find((f) => f.key === request.status)
                        ?.color || "from-gray-400 to-gray-500"
                    } shadow-lg animate-pulse`}
                  />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-gray-900 text-lg leading-6 mb-2">
                      {request.purpose}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(request.request_date)}</span>
                      <span className="mx-3">•</span>
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatTime(request.request_date)}</span>
                    </div>
                  </div>
                  <div
                    className={`bg-gradient-to-r ${
                      statusFilters.find((f) => f.key === request.status)
                        ?.color || "from-gray-400 to-gray-500"
                    } text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shadow-lg`}
                  >
                    {getStatusText(request.status)}
                  </div>
                </div>

                {request.request_number && (
                  <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-100/50">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600 font-mono">
                        รหัส: {request.request_number}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Items Summary */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mr-4">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {Array.isArray(request.items)
                          ? request.items.length
                          : 0}{" "}
                        รายการ
                      </p>
                      <p className="text-sm text-gray-500">รายการที่ขอเบิก</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      {getTotalItems(request.items)}
                    </p>
                    <p className="text-sm text-gray-500">ชิ้น</p>
                  </div>
                </div>

                {/* Items Preview */}
                {Array.isArray(request.items) && request.items.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      รายละเอียด:
                    </p>
                    {request.items.slice(0, 2).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-100/50"
                      >
                        <div className="flex items-center flex-1">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-4"></div>
                          <span className="text-sm text-gray-700 font-medium truncate">
                            {item.product?.name || "ไม่ระบุ"}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-blue-600 ml-4 bg-blue-50 px-3 py-1 rounded-lg">
                          {item.quantity} ชิ้น
                        </span>
                      </div>
                    ))}

                    {request.items.length > 2 && (
                      <div className="text-center py-3">
                        <span className="text-xs text-gray-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100/50">
                          และอีก {request.items.length - 2} รายการ
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {(!Array.isArray(request.items) ||
                  request.items.length === 0) && (
                  <div className="text-center py-8 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50">
                    <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <span className="text-sm text-gray-500 font-medium">
                      ไม่มีรายการสินค้า
                    </span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm border-t border-gray-100/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    สร้างเมื่อ {formatDate(request.request_date)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
