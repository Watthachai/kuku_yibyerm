"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KULoading } from "@/components/ui/ku-loading";
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
    // ตัด ISSUED และ COMPLETED ออก
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
    return <KULoading variant="page" message="กำลังโหลดข้อมูลคำขอของคุณ..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              คำขอเบิกของฉัน
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ตรวจสอบสถานะการเบิก
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-20 px-4">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-xl max-w-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                เกิดข้อผิดพลาด
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                {error}
              </p>
              <Button
                onClick={loadRequests}
                className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-800 dark:to-blue-900 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              คำขอเบิกของฉัน
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ตรวจสอบสถานะการเบิก
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-20 px-4">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-xl max-w-sm">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                ยังไม่มีคำขอเบิก
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-8 leading-relaxed">
                เมื่อคุณส่งคำขอเบิกครุภัณฑ์แล้ว จะแสดงรายการและสถานะที่นี่
              </p>
              <Button
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-800 dark:to-blue-900 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 pb-16">
      {/* Modern Header with Stats */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                คำขอเบิกของฉัน
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                ทั้งหมด{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
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
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 p-2.5 rounded-xl backdrop-blur-sm"
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
                      : "bg-white/60 dark:bg-slate-800/60 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700 backdrop-blur-sm"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {filter.label}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
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
      <div className="px-2 py-4 space-y-3">
        {filteredRequests.length === 0 ? (
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                ไม่พบคำขอในสถานะนี้
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs">
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
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* Header */}
              <div className="p-2 border-b border-gray-100/50 dark:border-slate-700/50 relative">
                <div className="absolute top-2 right-2">
                  <div
                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                      statusFilters.find((f) => f.key === request.status)
                        ?.color || "from-gray-400 to-gray-500"
                    } shadow-lg`}
                  />
                </div>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 pr-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-6 mb-1 line-clamp-1">
                      {request.purpose}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-300">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      <span>{formatDate(request.request_date)}</span>
                      <span className="mx-1">•</span>
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      <span>{formatTime(request.request_date)}</span>
                    </div>
                  </div>
                  <div
                    className={`bg-gradient-to-r ${
                      statusFilters.find((f) => f.key === request.status)
                        ?.color || "from-gray-400 to-gray-500"
                    } text-white px-3 py-1.5 rounded text-sm font-semibold whitespace-nowrap shadow-lg`}
                  >
                    {getStatusText(request.status)}
                  </div>
                </div>
                {request.request_number && (
                  <div className="bg-gray-50/80 dark:bg-slate-900/60 backdrop-blur-sm rounded px-2 py-1 border border-gray-100/50 dark:border-slate-700/50 mt-1">
                    <div className="flex items-center">
                      <FileText className="w-3 h-3 text-gray-400 dark:text-gray-500 mr-1.5" />
                      <span className="text-[11px] text-gray-600 dark:text-gray-300 font-mono">
                        รหัส: {request.request_number}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Items Summary */}
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded flex items-center justify-center mr-2">
                      <Package className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Array.isArray(request.items)
                          ? request.items.length
                          : 0}{" "}
                        รายการ
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-300">
                        รายการที่ขอเบิก
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                      {getTotalItems(request.items)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      ชิ้น
                    </p>
                  </div>
                </div>

                {/* Items Preview */}
                {Array.isArray(request.items) && request.items.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                      รายการ:
                    </p>
                    {request.items.slice(0, 1).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded px-2 py-1 border border-gray-100/50 dark:border-slate-700/50"
                      >
                        <div className="flex items-center flex-1">
                          <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-700 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-700 dark:text-gray-200 font-medium truncate">
                            {item.product?.name || "ไม่ระบุ"}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 ml-2 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                          {item.quantity} ชิ้น
                        </span>
                      </div>
                    ))}
                    {request.items.length > 1 && (
                      <div className="text-center py-1">
                        <span className="text-xs text-gray-500 dark:text-gray-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-gray-100/50 dark:border-slate-700/50">
                          และอีก {request.items.length - 1} รายการ
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {(!Array.isArray(request.items) ||
                  request.items.length === 0) && (
                  <div className="text-center py-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded border border-gray-100/50 dark:border-slate-700/50">
                    <Package className="w-5 h-5 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-300 font-medium">
                      ไม่มีรายการสินค้า
                    </span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-2 py-1.5 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm border-t border-gray-100/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-300 font-medium">
                    สร้างเมื่อ {formatDate(request.request_date)}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
