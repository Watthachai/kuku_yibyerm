"use client";

import { BorrowRequest } from "@/features/shared/types/request.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, User, FileText } from "lucide-react";

interface RequestReceiptTemplateProps {
  request: BorrowRequest;
  className?: string;
}

export function RequestReceiptTemplate({
  request,
  className = "",
}: RequestReceiptTemplateProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "รออนุมัติ",
      APPROVED: "อนุมัติแล้ว",
      REJECTED: "ปฏิเสธ",
      ISSUED: "เบิกออกแล้ว",
      COMPLETED: "เสร็จสิ้น",
    };
    return statusMap[status] || status;
  };

  const totalItems = request.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div
      id="request-receipt-template"
      className={`bg-white p-8 max-w-4xl mx-auto print:shadow-none ${className}`}
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        lineHeight: "1.5",
        color: "#000000",
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-green-600 pb-4">
        <div className="flex items-center justify-center mb-2">
          <Package className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              มหาวิทยาลัยเกษตรศาสตร์
            </h1>
            <p className="text-lg text-gray-600">ใบคำขอเบิกครุภัณฑ์</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          วันที่พิมพ์: {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* Request Information */}
      <Card className="mb-6 print:shadow-none print:border">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">ข้อมูลคำขอ</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">เลขที่คำขอ</p>
              <p className="font-semibold text-lg">
                {request.requestNumber || `REQ-${request.id}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">สถานะ</p>
              <Badge className={getStatusColor(request.status)}>
                {getStatusText(request.status)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">วันที่ส่งคำขอ</p>
              <p className="font-medium">{formatDate(request.requestDate)}</p>
            </div>
            {request.approvedDate && (
              <div>
                <p className="text-sm text-gray-600">วันที่อนุมัติ</p>
                <p className="font-medium">
                  {formatDate(request.approvedDate)}
                </p>
              </div>
            )}
          </div>

          {request.purpose && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">วัตถุประสงค์</p>
              <p className="font-medium">{request.purpose}</p>
            </div>
          )}

          {request.notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">หมายเหตุ</p>
              <p className="font-medium">{request.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Information */}
      <Card className="mb-6 print:shadow-none print:border">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold">ข้อมูลผู้ขอ</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ชื่อ</p>
              <p className="font-medium">{request.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">อีเมล</p>
              <p className="font-medium">{request.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">หน่วยงาน</p>
              <p className="font-medium">
                {request.user.department || "ไม่ระบุ"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="mb-6 print:shadow-none print:border">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Package className="w-5 h-5 text-orange-600 mr-2" />
            <h2 className="text-xl font-semibold">รายการครุภัณฑ์</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    ลำดับ
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    ชื่อครุภัณฑ์
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    หมวดหมู่
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    จำนวน
                  </th>
                </tr>
              </thead>
              <tbody>
                {request.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        {item.product.code && (
                          <p className="text-sm text-gray-600">
                            รหัส: {item.product.code}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.product.category || "ไม่ระบุ"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td
                    colSpan={3}
                    className="border border-gray-300 px-4 py-2 text-right"
                  >
                    รวมทั้งหมด:
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {totalItems} ชิ้น
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="mb-8 print:shadow-none print:border">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">สรุป</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {request.items.length}
              </p>
              <p className="text-sm text-blue-800">รายการ</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{totalItems}</p>
              <p className="text-sm text-green-800">ชิ้นทั้งหมด</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <Badge className={getStatusColor(request.status)}>
                {getStatusText(request.status)}
              </Badge>
              <p className="text-sm text-orange-800 mt-1">สถานะปัจจุบัน</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="text-center">
          <p className="font-semibold mb-4">ผู้ขอ</p>
          <div className="border-b-2 border-gray-400 mb-2 h-16"></div>
          <p className="text-sm">({request.user.name})</p>
          <p className="text-xs text-gray-600">
            วันที่: {formatDate(request.requestDate)}
          </p>
        </div>

        <div className="text-center">
          <p className="font-semibold mb-4">ผู้อนุมัติ</p>
          <div className="border-b-2 border-gray-400 mb-2 h-16"></div>
          {request.approvedBy ? (
            <>
              <p className="text-sm">({request.approvedBy.name})</p>
              <p className="text-xs text-gray-600">
                วันที่: {formatDate(request.approvedBy.approvedAt)}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">(รออนุมัติ)</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t pt-4">
        <p>ระบบจัดการครุภัณฑ์ มหาวิทยาลัยเกษตรศาสตร์</p>
        <p>สร้างเมื่อ: {new Date().toLocaleString("th-TH")}</p>
      </div>
    </div>
  );
}
