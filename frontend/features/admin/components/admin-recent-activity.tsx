import { RecentActivity } from "@/types/admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import {
  Activity,
  FileText,
  UserPlus,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

interface AdminRecentActivityProps {
  activities: RecentActivity[];
}

export function AdminRecentActivity({ activities }: AdminRecentActivityProps) {
  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "REQUEST":
        return FileText;
      case "APPROVAL":
        return CheckCircle;
      case "REJECTION":
        return XCircle;
      case "USER_CREATED":
        return UserPlus;
      case "RETURN":
        return RotateCcw;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: RecentActivity["type"]) => {
    switch (type) {
      case "REQUEST":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
      case "APPROVAL":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "REJECTION":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
      case "USER_CREATED":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200";
      case "RETURN":
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200";
    }
  };

  const getActivityText = (type: RecentActivity["type"]) => {
    switch (type) {
      case "REQUEST":
        return "คำขอใหม่";
      case "APPROVAL":
        return "อนุมัติ";
      case "REJECTION":
        return "ปฏิเสธ";
      case "USER_CREATED":
        return "ผู้ใช้ใหม่";
      case "RETURN":
        return "คืนแล้ว";
      default:
        return "กิจกรรม";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">กิจกรรมล่าสุด</CardTitle>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          ดูทั้งหมด
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="mx-auto h-8 w-8 mb-2 text-gray-400 dark:text-gray-500" />
              <p>ยังไม่มีกิจกรรม</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm border dark:border-slate-600">
                      <Icon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActivityColor(activity.type)}>
                        {getActivityText(activity.type)}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                          locale: th,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {activity.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        โดย {activity.user.name}
                        {activity.user.department &&
                          ` • ${activity.user.department}`}
                      </p>
                      {activity.item && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {activity.item.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
