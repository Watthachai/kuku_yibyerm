"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Printer, Share } from "lucide-react";
import { BorrowRequest } from "@/features/shared/types/request.types";
import { PDFGenerator } from "@/lib/pdf-generator";
import { toast } from "sonner";

interface PDFActionsProps {
  request: BorrowRequest;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

export function PDFActions({
  request,
  variant = "outline",
  size = "sm",
  showLabel = true,
}: PDFActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      await PDFGenerator.generateRequestReceipt(request);
      toast.success("ดาวน์โหลด PDF สำเร็จ");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("ไม่สามารถสร้าง PDF ได้");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("เปิดหน้าต่างพิมพ์แล้ว");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `คำขอเบิก ${request.requestNumber || request.id}`,
          text: `คำขอเบิกครุภัณฑ์ ${request.items.length} รายการ`,
          url: window.location.href,
        });
      } else {
        // Fallback: Copy link
        await navigator.clipboard.writeText(window.location.href);
        toast.success("คัดลอกลิงก์แล้ว");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("ไม่สามารถแชร์ได้");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isGenerating}>
          <FileText className="w-4 h-4 mr-2" />
          {showLabel && (isGenerating ? "กำลังสร้าง..." : "ส่งออก")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadPDF} disabled={isGenerating}>
          <Download className="w-4 h-4 mr-2" />
          ดาวน์โหลด PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          พิมพ์
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share className="w-4 h-4 mr-2" />
          แชร์
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
