import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BorrowRequest } from "@/features/shared/types/request.types";

// ⭐ Add Thai font support (optional)
declare module "jspdf" {
  interface jsPDF {
    addFont(postScriptName: string, id: string, fontStyle: string): string;
  }
}

interface PDFOptions {
  format?: "A4" | "Letter";
  orientation?: "portrait" | "landscape";
  margin?: number;
  fontSize?: number;
  lineHeight?: number;
}

export class PDFGenerator {
  private static defaultOptions: PDFOptions = {
    format: "A4",
    orientation: "portrait",
    margin: 20,
    fontSize: 12,
    lineHeight: 1.5,
  };

  // ⭐ Generate Receipt PDF
  static async generateRequestReceipt(
    request: BorrowRequest,
    options: PDFOptions = {}
  ): Promise<void> {
    const opts = { ...this.defaultOptions, ...options };
    const pdf = new jsPDF({
      orientation: opts.orientation,
      unit: "mm",
      format: opts.format,
    });

    // ⭐ Add Thai font (if needed)
    pdf.addFont("/fonts/THSarabunNew.ttf", "THSarabun", "normal");
    pdf.setFont("THSarabun");

    let yPosition = opts.margin!;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - opts.margin! * 2;

    // ⭐ Header - KU Logo & Title
    this.addHeader(pdf, yPosition, contentWidth, opts.margin!);
    yPosition += 40;

    // ⭐ Request Info
    yPosition = this.addRequestInfo(
      pdf,
      request,
      yPosition,
      contentWidth,
      opts
    );
    yPosition += 15;

    // ⭐ Items Table
    yPosition = this.addItemsTable(
      pdf,
      request.items,
      yPosition,
      contentWidth,
      opts
    );
    yPosition += 15;

    // ⭐ Summary & Signatures
    this.addSummaryAndSignatures(pdf, request, yPosition, contentWidth, opts);

    // ⭐ Footer
    this.addFooter(pdf, opts.margin!);

    // ⭐ Download PDF
    const fileName = `คำขอเบิก_${
      request.requestNumber || request.id
    }_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
  }

  // ⭐ Generate from HTML Element
  static async generateFromElement(
    elementId: string,
    filename: string,
    options: PDFOptions = {}
  ): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: options.orientation || "portrait",
      unit: "mm",
      format: options.format || "A4",
    });

    const imgWidth =
      pdf.internal.pageSize.getWidth() - (options.margin || 20) * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      options.margin || 10,
      options.margin || 10,
      imgWidth,
      imgHeight
    );
    pdf.save(filename);
  }

  // ⭐ Helper Methods
  private static addHeader(
    pdf: jsPDF,
    y: number,
    contentWidth: number,
    margin: number
  ): void {
    // KU Logo (placeholder)
    pdf.setFontSize(16);
    pdf.setFont("THSarabun", "bold");
    pdf.text("มหาวิทยาลัยเกษตรศาสตร์", margin, y);

    pdf.setFontSize(14);
    pdf.setFont("THSarabun", "normal");
    pdf.text("ใบคำขอเบิกครุภัณฑ์", margin, y + 8);

    // Date
    const today = new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    pdf.text(`วันที่พิมพ์: ${today}`, margin + contentWidth - 60, y);
  }

  private static addRequestInfo(
    pdf: jsPDF,
    request: BorrowRequest,
    y: number,
    contentWidth: number,
    options: PDFOptions
  ): number {
    pdf.setFontSize(12);
    pdf.setFont("THSarabun", "bold");
    pdf.text("ข้อมูลคำขอ", options.margin!, y);

    y += 8;
    pdf.setFont("THSarabun", "normal");

    const requestInfo = [
      `เลขที่คำขอ: ${request.requestNumber || request.id}`,
      `ผู้ขอ: ${request.user.name}`,
      `อีเมล: ${request.user.email}`,
      `หน่วยงาน: ${request.user.department || "ไม่ระบุ"}`,
      `วันที่ส่งคำขอ: ${new Date(request.requestDate).toLocaleDateString(
        "th-TH"
      )}`,
      `สถานะ: ${this.getStatusText(request.status)}`,
      `วัตถุประสงค์: ${request.purpose}`,
    ];

    if (request.notes) {
      requestInfo.push(`หมายเหตุ: ${request.notes}`);
    }

    requestInfo.forEach((info, index) => {
      pdf.text(info, options.margin!, y + index * 6);
    });

    return y + requestInfo.length * 6;
  }

  private static addItemsTable(
    pdf: jsPDF,
    items: BorrowRequest["items"],
    y: number,
    contentWidth: number,
    options: PDFOptions
  ): number {
    pdf.setFontSize(12);
    pdf.setFont("THSarabun", "bold");
    pdf.text("รายการครุภัณฑ์", options.margin!, y);

    y += 10;

    // Table Header
    const colWidths = [10, 80, 30, 20]; // ลำดับ, ชื่อ, หมวดหมู่, จำนวน
    const headers = ["ลำดับ", "ชื่อครุภัณฑ์", "หมวดหมู่", "จำนวน"];

    let xPos = options.margin!;
    pdf.setFont("THSarabun", "bold");
    headers.forEach((header, index) => {
      pdf.text(header, xPos, y);
      xPos += colWidths[index];
    });

    // Table Border
    pdf.line(options.margin!, y + 2, options.margin! + contentWidth, y + 2);
    y += 8;

    // Table Rows
    pdf.setFont("THSarabun", "normal");
    items.forEach((item, index) => {
      xPos = options.margin!;
      const rowData = [
        (index + 1).toString(),
        item.product.name || "ไม่ระบุ",
        item.product.category || "ไม่ระบุ",
        item.quantity.toString(),
      ];

      rowData.forEach((data, colIndex) => {
        // ⭐ Handle long text wrapping
        if (colIndex === 1 && data.length > 35) {
          const lines = pdf.splitTextToSize(data, colWidths[colIndex] - 5);
          pdf.text(lines[0] + "...", xPos, y);
        } else {
          pdf.text(data, xPos, y);
        }
        xPos += colWidths[colIndex];
      });
      y += 6;
    });

    // Bottom border
    pdf.line(options.margin!, y + 2, options.margin! + contentWidth, y + 2);

    return y + 5;
  }

  private static addSummaryAndSignatures(
    pdf: jsPDF,
    request: BorrowRequest,
    y: number,
    contentWidth: number,
    options: PDFOptions
  ): void {
    // Summary
    pdf.setFontSize(12);
    pdf.setFont("THSarabun", "bold");
    pdf.text("สรุป", options.margin!, y);

    y += 8;
    pdf.setFont("THSarabun", "normal");

    const totalItems = request.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    pdf.text(
      `จำนวนรายการทั้งหมด: ${request.items.length} รายการ`,
      options.margin!,
      y
    );
    pdf.text(`จำนวนชิ้นทั้งหมด: ${totalItems} ชิ้น`, options.margin!, y + 6);

    // Signatures
    y += 25;
    const signatureWidth = (contentWidth - 20) / 2;

    pdf.setFont("THSarabun", "bold");
    pdf.text("ผู้ขอ", options.margin!, y);
    pdf.text("ผู้อนุมัติ", options.margin! + signatureWidth + 20, y);

    y += 20;
    pdf.line(options.margin!, y, options.margin! + signatureWidth, y);
    pdf.line(
      options.margin! + signatureWidth + 20,
      y,
      options.margin! + contentWidth,
      y
    );

    y += 8;
    pdf.setFont("THSarabun", "normal");
    pdf.text(`(${request.user.name})`, options.margin!, y);

    if (request.approvedBy) {
      pdf.text(
        `(${request.approvedBy.name})`,
        options.margin! + signatureWidth + 20,
        y
      );
      pdf.text(
        `วันที่: ${new Date(request.approvedBy.approvedAt).toLocaleDateString(
          "th-TH"
        )}`,
        options.margin! + signatureWidth + 20,
        y + 6
      );
    }
  }

  private static addFooter(pdf: jsPDF, margin: number): void {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(8);
    pdf.setFont("THSarabun", "normal");
    pdf.text(
      "ระบบจัดการครุภัณฑ์ มหาวิทยาลัยเกษตรศาสตร์",
      margin,
      pageHeight - 10
    );
    pdf.text(
      `สร้างเมื่อ: ${new Date().toLocaleString("th-TH")}`,
      pageWidth - margin - 50,
      pageHeight - 10
    );
  }

  private static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: "รออนุมัติ",
      APPROVED: "อนุมัติแล้ว",
      REJECTED: "ปฏิเสธ",
      ISSUED: "เบิกออกแล้ว",
      COMPLETED: "เสร็จสิ้น",
    };
    return statusMap[status] || status;
  }
}
