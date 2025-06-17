"use client";

import { useState, useEffect } from "react";
import { Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BorrowRequest, RequestStatus } from "@/features/shared/types/request.types";
import { RequestCard } from "./request-card";
import { ApprovalModal } from "./approval-modal";

interface RequestStats {
  pending: number;
  approved: number;
  rejected: number;
  borrowed: number;
  overdue: number;
}

export function RequestManagement() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    borrowed: 0,
    overdue: 0,
  });
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RequestStatus | "all">("PENDING");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // TODO: Call API to get requests
      // const data = await AdminService.getRequests();
      
      // Mock data for now
      const mockRequests: BorrowRequest[] = [
        {
          id: "1",
          requestNumber: "REQ-2025-001",
          user: {
            id: "u1",
            name: "นาย สมชาย ใจดี",
            email: "somchai@ku.ac.th",
            department: "คณะเกษตร",
          },
          items: [
            {
              id: "i1",
              product: {
                id: "p1",
                name: "เครื่องฉายภาพ Epson EB-X41",
                code: "EP001-2024",
              },
              quantity: 1,
              purpose: "ใช้ในการสอน",
            },
          ],
          purpose: "การสอนในรายวิชา เกษตรเบื้องต้น",
          requestDate: new Date().toISOString(),
          expectedStartDate: new Date().toISOString(),
          expectedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "PENDING",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setRequests(mockRequests);
      
      // Calculate stats
      const newStats = mockRequests.reduce((acc, req) => {
        acc[req.status.toLowerCase() as keyof RequestStats]++;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0, borrowed: 0, overdue: 0 });
      
      setStats(newStats);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: "APPROVE" | "REJECT", note?: string) => {
    try {
      // TODO: Call API to approve/reject request
      console.log("Approval action:", { requestId, action, note });
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: action === "APPROVE" ? "APPROVED" : "REJECTED",
              adminNote: note,
              approvedBy: action === "APPROVE" ? {
                id: "admin1",
                name: "ผู้ดูแลระบบ",
                approvedAt: new Date().toISOString(),
              } : undefined,
              rejectedBy: action === "REJECT" ? {
                id: "admin1",
                name: "ผู้ดูแลระบบ",
                rejectedAt: new Date().toISOString(),
                reason: note || "",
              } : undefined,
            }
          : req
      ));
      
      setSelectedRequest(null);
      await loadRequests(); // Reload to get fresh stats
    } catch (error) {
      console.error("Failed to process approval:", error);
    }
  };

  const filteredRequests = activeTab === "all" 
    ? requests 
    : requests.filter(req => req.status === activeTab);

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "APPROVED": return "bg-green-100 text-green-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "BORROWED": return "bg-blue-100 text-blue-800";
      case "RETURNED": return "bg-gray-100 text-gray-800";
      case "OVERDUE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case "PENDING": return "รออนุมัติ";
      case "APPROVED": return "อนุมัติแล้ว";
      case "REJECTED": return "ปฏิเสธ";
      case "BORROWED": return "กำลังยืม";
      case "RETURNED": return "คืนแล้ว";
      case "OVERDUE": return "เกินกำหนด";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">จัดการคำขอยืม-คืน</h1>
        <p className="text-gray-600">อนุมัติและติดตามคำขอยืมครุภัณฑ์</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("PENDING")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รออนุมัติ</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">ด่วน</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("APPROVED")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("BORROWED")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">กำลังยืม</p>
                <p className="text-2xl font-bold text-blue-600">{stats.borrowed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("REJECTED")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ปฏิเสธ</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("OVERDUE")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เกินกำหนด</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              {stats.overdue > 0 && <Badge variant="destructive">!</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RequestStatus | "all")}>
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          <TabsTrigger value="PENDING">รออนุมัติ ({stats.pending})</TabsTrigger>
          <TabsTrigger value="APPROVED">อนุมัติแล้ว</TabsTrigger>
          <TabsTrigger value="BORROWED">กำลังยืม</TabsTrigger>
          <TabsTrigger value="OVERDUE">เกินกำหนด</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">ไม่มีคำขอในหมวดนี้</p>
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