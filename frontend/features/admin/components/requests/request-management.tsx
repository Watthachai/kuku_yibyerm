"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner"; // ⭐ ใช้ sonner แทน
import {
  BorrowRequest,
  RequestStatus,
} from "@/features/shared/types/request.types";
import { AdminRequestService } from "@/features/admin/services/admin-request-service";
import { RequestCard } from "./request-card";
import { ApprovalModal } from "./approval-modal";
import { RefreshCw } from "lucide-react";

interface RequestStats {
  pending: number;
  approved: number;
  rejected: number;
  issued: number;
  completed: number;
}

export function RequestManagement() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    issued: 0,
    completed: 0,
  });
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RequestStatus | "all">("PENDING");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      console.log("🔍 Loading admin requests...");

      const data = await AdminRequestService.getAllRequests();
      console.log("✅ Loaded requests:", data);

      setRequests(data);

      // คำนวณสถิติ
      const newStats = data.reduce(
        (acc, req) => {
          const status = req.status.toLowerCase();
          if (status in acc) {
            acc[status as keyof RequestStats]++;
          }
          return acc;
        },
        { pending: 0, approved: 0, rejected: 0, issued: 0, completed: 0 }
      );

      setStats(newStats);

      // ⭐ ใช้ sonner toast
      toast.success("โหลดข้อมูลสำเร็จ", {
        description: `พบคำขอทั้งหมด ${data.length} รายการ`,
      });
    } catch (error) {
      console.error("Failed to load requests:", error);
      // ⭐ ใช้ sonner toast
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถโหลดข้อมูลคำขอได้",
      });
    } finally {
      setLoading(false);
    }
  };

  // ⭐ อนุมัติ/ปฏิเสธคำขอ
  const handleApproval = async (
    requestId: string,
    action: "APPROVE" | "REJECT",
    note?: string
  ) => {
    try {
      await AdminRequestService.updateRequestStatus(requestId, {
        action,
        notes: note,
      });

      // ⭐ ใช้ sonner toast
      toast.success(action === "APPROVE" ? "อนุมัติสำเร็จ" : "ปฏิเสธสำเร็จ", {
        description: `คำขอ ${requestId} ได้รับการ${
          action === "APPROVE" ? "อนุมัติ" : "ปฏิเสธ"
        }แล้ว`,
      });

      setSelectedRequest(null);
      await loadRequests(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error("Failed to process approval:", error);
      // ⭐ ใช้ sonner toast
      toast.error("เกิดข้อผิดพลาด", {
        description:
          error instanceof Error ? error.message : "ไม่สามารถดำเนินการได้",
      });
    }
  };

  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((req) => req.status === activeTab);

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "ISSUED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case "PENDING":
        return "รออนุมัติ";
      case "APPROVED":
        return "อนุมัติแล้ว";
      case "REJECTED":
        return "ปฏิเสธ";
      case "ISSUED":
        return "เบิกออกแล้ว";
      case "COMPLETED":
        return "เสร็จสิ้น";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการคำขอเบิก</h1>
          <p className="text-gray-600">อนุมัติและติดตามคำขอเบิกครุภัณฑ์</p>
        </div>
        <Button
          onClick={loadRequests}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card
          className={`hover:shadow-md transition-shadow cursor-pointer ${
            activeTab === "PENDING" ? "ring-2 ring-yellow-500" : ""
          }`}
          onClick={() => setActiveTab("PENDING")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รออนุมัติ</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              {stats.pending > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">ด่วน</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`hover:shadow-md transition-shadow cursor-pointer ${
            activeTab === "APPROVED" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => setActiveTab("APPROVED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`hover:shadow-md transition-shadow cursor-pointer ${
            activeTab === "ISSUED" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setActiveTab("ISSUED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เบิกออกแล้ว</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.issued}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`hover:shadow-md transition-shadow cursor-pointer ${
            activeTab === "REJECTED" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() => setActiveTab("REJECTED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ปฏิเสธ</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`hover:shadow-md transition-shadow cursor-pointer ${
            activeTab === "COMPLETED" ? "ring-2 ring-gray-500" : ""
          }`}
          onClick={() => setActiveTab("COMPLETED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เสร็จสิ้น</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.completed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as RequestStatus | "all")}
      >
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด ({requests.length})</TabsTrigger>
          <TabsTrigger value="PENDING">รออนุมัติ ({stats.pending})</TabsTrigger>
          <TabsTrigger value="APPROVED">
            อนุมัติแล้ว ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="ISSUED">เบิกออกแล้ว ({stats.issued})</TabsTrigger>
          <TabsTrigger value="COMPLETED">
            เสร็จสิ้น ({stats.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">
                  {activeTab === "all"
                    ? "ยังไม่มีคำขอในระบบ"
                    : `ไม่มีคำขอ${getStatusText(activeTab as RequestStatus)}`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAction={(req) => setSelectedRequest(req)}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      {selectedRequest && (
        <ApprovalModal
          request={selectedRequest}
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApproval={handleApproval}
        />
      )}
    </div>
  );
}
