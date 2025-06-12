/* สร้างไฟล์: /Users/itswatthachai/kuku_yibyerm/frontend/components/dashboard/RecentActivity.tsx */
"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RecentActivity } from "@/features/dashboard/types";

interface RecentActivityProps {
  activities: RecentActivity[];
  maxItems?: number;
}

const activityTypeConfig = {
  BORROW: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    label: "ยืม",
  },
  RETURN: {
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
    label: "คืน",
  },
  REQUEST: {
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    label: "ขอ",
  },
  APPROVE: {
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    label: "อนุมัติ",
  },
};

export function RecentActivity({
  activities,
  maxItems = 5,
}: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className="ku-bg-card ku-border">
      <CardHeader>
        <CardTitle className="ku-text-primary">กิจกรรมล่าสุด</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>ยังไม่มีกิจกรรมล่าสุด</p>
          </div>
        ) : (
          displayActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* User Avatar */}
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={activity.user?.avatar} />
                <AvatarFallback className="text-xs">
                  {activity.user?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs px-2 py-0.5",
                      activityTypeConfig[activity.type].color
                    )}
                  >
                    {activityTypeConfig[activity.type].label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, {
                      addSuffix: true,
                      locale: th,
                    })}
                  </span>
                </div>

                <p className="text-sm text-foreground leading-relaxed">
                  {activity.description}
                </p>
                {/* Item Image */}
                {activity.item?.image && (
                  <div className="flex items-center gap-2 mt-2">
                    <Image
                      src={activity.item.image}
                      alt={activity.item.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded object-cover"
                    />
                    <span className="text-xs text-muted-foreground">
                      {activity.item.name}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
