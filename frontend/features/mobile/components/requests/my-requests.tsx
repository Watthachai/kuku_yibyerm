"use client";

import { useState, useEffect } from "react";
import { RequestService, BorrowRequest } from "@/lib/api/request.service";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Calendar, Clock } from "lucide-react";

export function MyRequests() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await RequestService.getMyRequests();
      setRequests(data.requests);
    } catch (error) {
      console.error("Failed to load requests:", error);
      toast.error("เกิดข้อผิดพลาด: ไม่สามารถโหลดคำขอได้");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "รออนุมัติ";
      case "APPROVED": return "อนุมัติแล้ว";
      case "REJECTED": return "ปฏิเสธ";
      case "ISSUED": return "เบิกแล้ว";
      case "COMPLETED": return "เสร็จสิ้น";
      default: return status;
    }
  };

  const filteredRequests = activeTab === "all" 
    ? requests 
    : requests.filter(req => req.status === activeTab);

  const stats = requests.reduce((acc, req) => {
    const status = req.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">คำขอเบิกของฉัน</h1>
        <p className="text-sm text-gray-600">ติดตามสถานะคำขอเบิกครุภัณฑ์</p>
      </div>

      {/* Quick Stats */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="p-3">
              <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-600">{stats.pending || 0}</div>
              <div className="text-xs text-gray-600">รออนุมัติ</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-3">
              <Package className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">{stats.borrowed || 0}</div>
              <div className="text-xs text-gray-600">กำลังยืม</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-3">
              <Calendar className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-600">{stats.returned || 0}</div>
              <div className="text-xs text-gray-600">คืนแล้ว</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Requests List */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="PENDING">รออนุมัติ</TabsTrigger>
            <TabsTrigger value="ISSUED">เบิกแล้ว</TabsTrigger>
            <TabsTrigger value="COMPLETED">เสร็จสิ้น</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3 mt-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">ไม่มีคำขอในหมวดนี้</p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {request.requestNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(request.requestDate).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {request.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.product.name}</p>
                              <p className="text-xs text-gray-600">จำนวน: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Purpose */}
                      <div className="text-sm">
                        <span className="text-gray-600">วัตถุประสงค์: </span>
                        <span className="text-gray-900">{request.purpose}</span>
                      </div>

                      {/* Admin Note */}
                      {request.adminNote && (
                        <div className="text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          <span className="text-blue-800 font-medium">หมายเหตุจากเจ้าหน้าที่: </span>
                          <span className="text-blue-700">{request.adminNote}</span>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {request.rejectedBy && (
                        <div className="text-sm p-2 bg-red-50 rounded border-l-4 border-red-400">
                          <span className="text-red-800 font-medium">เหตุผลที่ปฏิเสธ: </span>
                          <span className="text-red-700">{request.rejectedBy.reason}</span>
                        </div>
                      )}

                      {/* Actions */}
                      {request.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            แก้ไขคำขอ
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                            ยกเลิกคำขอ
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}