"use client";

import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  User,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export interface RequestItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description?: string;
    category?: {
      name: string;
    };
  };
}

export interface Request {
  id: string;
  request_number: string;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ISSUED" | "COMPLETED";
  request_date: string;
  approved_date?: string;
  issued_date?: string;
  completed_date?: string;
  notes?: string;
  admin_note?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: RequestItem[];
  created_at: string;
  updated_at: string;
}

interface RequestCardProps {
  request: Request;
  onClick?: (request: Request) => void;
}

const statusConfig = {
  PENDING: {
    label: "รออนุมัติ",
    color:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700",
    icon: Clock,
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  APPROVED: {
    label: "อนุมัติแล้ว",
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700",
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  REJECTED: {
    label: "ถูกปฏิเสธ",
    color:
      "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700",
    icon: XCircle,
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  ISSUED: {
    label: "จ่ายแล้ว",
    color:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700",
    icon: Package,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  COMPLETED: {
    label: "เสร็จสิ้น",
    color:
      "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600",
    icon: CheckCircle,
    bgColor: "bg-gray-50 dark:bg-gray-800/30",
  },
};

export function RequestCard({ request, onClick }: RequestCardProps) {
  const config = statusConfig[request.status];
  const StatusIcon = config.icon;

  const handleClick = () => {
    if (onClick) {
      onClick(request);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: th });
    } catch {
      return "ไม่ระบุ";
    }
  };

  const totalItems = request.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CardContent
      className={`p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer ${
        onClick ? "hover:scale-[1.02]" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              #{request.request_number}
            </h3>
            <Badge className={`${config.color} border text-xs px-2 py-1`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
            {request.purpose}
          </p>
        </div>

        {onClick && (
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>วันที่ขอ: {formatDate(request.request_date)}</span>
          </div>
          <div className="flex items-center">
            <Package className="w-3 h-3 mr-1" />
            <span>
              {request.items.length} รายการ ({totalItems} ชิ้น)
            </span>
          </div>
        </div>

        {/* Items Preview */}
        <div className="mt-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            รายการที่ขอ:
          </div>
          <div className="space-y-1">
            {request.items.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs bg-gray-50 dark:bg-slate-700 rounded-lg px-2 py-1"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                  {item.product.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  x{item.quantity}
                </span>
              </div>
            ))}
            {request.items.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                และอีก {request.items.length - 2} รายการ...
              </div>
            )}
          </div>
        </div>

        {/* Additional Status Info */}
        {request.status === "APPROVED" && request.approved_date && (
          <div className="flex items-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded px-2 py-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            <span>อนุมัติเมื่อ: {formatDate(request.approved_date)}</span>
          </div>
        )}

        {request.status === "ISSUED" && request.issued_date && (
          <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
            <Package className="w-3 h-3 mr-1" />
            <span>จ่ายเมื่อ: {formatDate(request.issued_date)}</span>
          </div>
        )}

        {request.status === "COMPLETED" && request.completed_date && (
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded px-2 py-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            <span>เสร็จสิ้นเมื่อ: {formatDate(request.completed_date)}</span>
          </div>
        )}

        {request.status === "REJECTED" && request.admin_note && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded px-2 py-1">
            <span className="font-medium">เหตุผล: </span>
            <span>{request.admin_note}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <User className="w-3 h-3 mr-1" />
          <span>{request.user.name}</span>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
          อัปเดต: {formatDate(request.updated_at)}
        </div>
      </div>
    </CardContent>
  );
}

// Skeleton component for loading state
export function RequestCardSkeleton() {
  return (
    <CardContent className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
          </div>
          <div className="w-5 h-5 bg-gray-200 dark:bg-slate-700 rounded ml-2"></div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
          </div>

          <div className="space-y-1">
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
          </div>
        </div>
      </div>
    </CardContent>
  );
}
