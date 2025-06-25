"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BorrowRequest } from "@/features/shared/types/request.types";
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Package,
  FileText,
} from "lucide-react";

interface ApprovalModalProps {
  request: BorrowRequest;
  isOpen: boolean;
  onClose: () => void;
  onApproval: (
    requestId: string,
    action: "APPROVE" | "REJECT",
    note?: string
  ) => Promise<void>;
}

export function ApprovalModal({
  request,
  isOpen,
  onClose,
  onApproval,
}: ApprovalModalProps) {
  const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action) return;

    try {
      setLoading(true);
      await onApproval(request.id, action, note);
      onClose();
      setAction(null);
      setNote("");
    } catch (error) {
      console.error("Error processing approval:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            ตรวจสอบคำขอเบิก
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">เลขที่คำขอ</p>
                      <p className="font-semibold">{request.requestNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">ผู้ขอ</p>
                      <p className="font-semibold">{request.user.name}</p>
                      <p className="text-sm text-gray-500">
                        {request.user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.user.department}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">วันที่ขอ</p>
                      <p className="font-semibold">
                        {formatDate(request.requestDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purpose */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">วัตถุประสงค์</h4>
              <p className="text-gray-700 bg-gray-50 dark:bg-slate-800 dark:text-gray-100 p-3 rounded-lg">
                {request.purpose}
              </p>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                รายการครุภัณฑ์ที่ขอเบิก
              </h4>
              <div className="space-y-3">
                {request.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        รหัส: {item.product.code}
                      </p>
                      <p className="text-sm text-gray-600">
                        วัตถุประสงค์: {item.purpose}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">จำนวน {item.quantity}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Selection */}
          {request.status === "PENDING" && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">การดำเนินการ</h4>
                <div className="flex gap-3 mb-4">
                  <Button
                    variant={action === "APPROVE" ? "default" : "outline"}
                    onClick={() => setAction("APPROVE")}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    อนุมัติ
                  </Button>
                  <Button
                    variant={action === "REJECT" ? "destructive" : "outline"}
                    onClick={() => setAction("REJECT")}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    ปฏิเสธ
                  </Button>
                </div>

                {action && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {action === "APPROVE"
                        ? "หมายเหตุ (ไม่บังคับ)"
                        : "เหตุผลในการปฏิเสธ"}
                    </label>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={
                        action === "APPROVE"
                          ? "ระบุหมายเหตุเพิ่มเติม..."
                          : "ระบุเหตุผลในการปฏิเสธ..."
                      }
                      rows={3}
                      required={action === "REJECT"}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            ยกเลิก
          </Button>
          {action && request.status === "PENDING" && (
            <Button
              onClick={handleSubmit}
              disabled={loading || (action === "REJECT" && !note.trim())}
              variant={action === "APPROVE" ? "default" : "destructive"}
            >
              {loading
                ? "กำลังดำเนินการ..."
                : action === "APPROVE"
                ? "อนุมัติคำขอ"
                : "ปฏิเสธคำขอ"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
