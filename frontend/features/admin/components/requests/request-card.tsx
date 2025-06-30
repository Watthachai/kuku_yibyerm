"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BorrowRequest,
  RequestStatus,
} from "@/features/shared/types/request.types";
import {
  User,
  Calendar,
  Package,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Download,
} from "lucide-react";
import { PDFGenerator } from "@/lib/pdf-generator";

interface RequestCardProps {
  request: BorrowRequest;
  onAction: (request: BorrowRequest) => void;
  getStatusColor: (status: RequestStatus) => string;
  getStatusText: (status: RequestStatus) => string;
}

export function RequestCard({
  request,
  onAction,
  getStatusColor,
  getStatusText,
}: RequestCardProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionButton = () => {
    switch (request.status) {
      case "PENDING":
        return (
          <Button
            size="sm"
            onClick={() => onAction(request)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="h-5 w-5 mr-2" />
            ตรวจสอบ
          </Button>
        );
      case "APPROVED":
        return (
          <Button size="sm" variant="outline" onClick={() => onAction(request)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            ดูรายละเอียด
          </Button>
        );
      case "REJECTED":
        return (
          <Button size="sm" variant="outline" onClick={() => onAction(request)}>
            <XCircle className="h-4 w-4 mr-2" />
            ดูเหตุผล
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="outline" onClick={() => onAction(request)}>
            <Eye className="h-4 w-4 mr-2" />
            ดูรายละเอียด
          </Button>
        );
    }
  };

  const getUrgencyIndicator = () => {
    if (request.status !== "PENDING") return null;

    const requestDate = new Date(request.requestDate);
    const now = new Date();
    const hoursDiff =
      (now.getTime() - requestDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return (
        <Badge variant="destructive" className="animate-pulse">
          <AlertCircle className="h-3 w-3 mr-1" />
          เร่งด่วน
        </Badge>
      );
    } else if (hoursDiff > 12) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <Clock className="h-3 w-3 mr-1" />
          ควรดำเนินการ
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="font-semibold text-lg">
                  {request.requestNumber}
                </h3>

                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  ส่งเมื่อ {formatDateTime(request.requestDate)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getUrgencyIndicator()}
            <Badge className={getStatusColor(request.status)}>
              {getStatusText(request.status)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-4">
          {/* User Info */}
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-gray-500 mt-1" />
            <div>
              <p className="font-medium">{request.user.name}</p>
              <p className="text-sm text-gray-600">{request.user.email}</p>
              {request.user.department ? (
                <div className="text-sm text-gray-600">
                  {request.user.department.faculty && (
                    <p className="text-gray-500">
                      {request.user.department.faculty}
                    </p>
                  )}
                  <p className="font-medium">{request.user.department.name}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">ไม่ระบุหน่วยงาน</p>
              )}
            </div>
          </div>
        </div>

        {/* Purpose */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">วัตถุประสงค์</p>
          <p className="text-gray-900 bg-gray-50 dark:bg-slate-800 dark:text-gray-100 p-3 rounded-lg text-sm">
            {request.purpose}
          </p>
        </div>

        {/* Items */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">
              รายการครุภัณฑ์ ({request.items.length} รายการ)
            </p>
          </div>
          <div className="space-y-2">
            {request.items.slice(0, 2).map((item, index) => (
              <div
                key={`${request.id}-item-${item.id}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded text-sm"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-gray-600">รหัส: {item.product.code}</p>
                </div>
                <Badge variant="outline">x{item.quantity}</Badge>
              </div>
            ))}
            {request.items.length > 2 && (
              <p className="text-xs text-gray-500 text-center py-1">
                และอีก {request.items.length - 2} รายการ
              </p>
            )}
          </div>
        </div>

        {/* Admin Notes */}
        {request.adminNote && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium mb-1">
              หมายเหตุจากผู้ดูแล
            </p>
            <p className="text-sm text-blue-800">{request.adminNote}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {getActionButton()}

          {["APPROVED", "ISSUED", "COMPLETED"].includes(request.status) && (
            <div className="flex gap-2">
              {request.status === "APPROVED" && (
                <Button
                  onClick={() => onAction(request)}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Truck className="h-4 w-4" />
                  เบิกออก
                </Button>
              )}
              {/* ดาวน์โหลด PDF ฝั่ง frontend */}
              <Button
                onClick={() => PDFGenerator.generateRequestReceipt(request)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                ใบกำกับ
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
