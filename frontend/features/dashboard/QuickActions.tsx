/* สร้างไฟล์: /Users/itswatthachai/kuku_yibyerm/frontend/components/dashboard/QuickActions.tsx */
"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuickAction } from "@/features/dashboard/types";

interface QuickActionsProps {
  actions: QuickAction[];
  maxItems?: number;
}

const colorClasses = {
  emerald:
    "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  blue: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  purple:
    "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  orange:
    "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
};

export function QuickActions({ actions, maxItems = 6 }: QuickActionsProps) {
  const displayActions = actions.slice(0, maxItems);

  return (
    <Card className="ku-bg-card ku-border">
      <CardHeader>
        <CardTitle className="ku-text-primary">การดำเนินการด่วน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Card
                  className={cn(
                    "h-full transition-all duration-300 hover:shadow-lg hover:scale-105",
                    "ku-border cursor-pointer group",
                    colorClasses[action.color]
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 group-hover:ku-text-primary transition-colors">
                          {action.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
