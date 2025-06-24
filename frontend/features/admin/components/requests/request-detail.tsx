import { PDFActions } from "@/components/pdf/pdf-actions";
import { RequestReceiptTemplate } from "@/components/print/request-receipt-template";
import { BorrowRequest } from "@/features/shared/types/request.types";

export function RequestDetail({ request }: { request: BorrowRequest }) {
  return (
    <div className="space-y-6">
      {/* Header with PDF Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          คำขอ {request.requestNumber || `#${request.id}`}
        </h1>
        <PDFActions request={request} />
      </div>

      {/* Print Template - Hidden on screen, visible when printing */}
      <div className="print:block hidden">
        <RequestReceiptTemplate request={request} />
      </div>

      {/* Regular content - Hidden when printing */}
      <div className="print:hidden">
        {/* Your existing request detail content */}
      </div>
    </div>
  );
}
