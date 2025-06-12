"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: "up" | "down";
  };
  icon: React.ComponentType<{ className?: string }>;
  color?: "emerald" | "blue" | "purple" | "orange" | "red";
  className?: string;
  delay?: number;
}

const colorClasses = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/20",
    icon: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    icon: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/20",
    icon: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color = "emerald",
  className,
  delay = 0,
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        className={cn(
          "ku-bg-card ku-border hover:shadow-lg transition-all duration-300",
          "hover:scale-105 cursor-pointer",
          colors.border,
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold ku-text-primary">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </h3>
                {change && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      change.trend === "up"
                        ? "text-emerald-600"
                        : "text-red-600"
                    )}
                  >
                    {change.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {change.value}% {change.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                colors.bg
              )}
            >
              <Icon className={cn("w-6 h-6", colors.icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
