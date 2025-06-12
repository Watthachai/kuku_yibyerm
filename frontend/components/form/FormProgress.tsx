"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormProgressProps {
  percentage: number;
  status: {
    type: "loading" | "error" | "success" | "warning" | "info";
    message: string;
  };
  errorCount?: number;
  className?: string;
}

const statusConfig = {
  loading: {
    icon: Loader2,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    animate: "animate-spin",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    animate: "",
  },
  success: {
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    animate: "",
  },
  warning: {
    icon: AlertCircle,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    animate: "",
  },
  info: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    animate: "",
  },
};

export function FormProgress({
  percentage,
  status,
  errorCount = 0,
  className,
}: FormProgressProps) {
  const config = statusConfig[status.type];
  const Icon = config.icon;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">ความสมบูรณ์ของแบบฟอร์ม</span>
          <span className="font-medium">{percentage}%</span>
        </div>
        <Progress
          value={percentage}
          className="h-2 transition-all duration-300"
        />
      </div>

      {/* Status Message */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-all",
          config.bgColor,
          config.borderColor
        )}
      >
        <Icon className={cn("w-4 h-4", config.color, config.animate)} />
        <span className={config.color}>{status.message}</span>

        {errorCount > 0 && (
          <Badge variant="destructive" className="ml-auto text-xs">
            {errorCount} ข้อผิดพลาด
          </Badge>
        )}
      </div>
    </div>
  );
}
