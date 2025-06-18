"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/guards/admin-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSystemStats } from "@/features/admin/components/admin-system-stats";
import {
  FileText,
  Download,
  BarChart3,
  Users,
  Package,
  Calendar,
  TrendingUp,
  Building2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExportReport = (reportType: string) => {
    setLoading(true);
    // TODO: Implement export functionality
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "กำลังพัฒนา",
        description: `การส่งออกรายงาน${reportType}จะเพิ่มในเร็วๆ นี้`,
      });
    }, 1000);
  };

  const reportCards = [
    {
      title: "รายงานการใช้งานรายเดือน",
      description: "สรุปการเบิก-คืนครุภัณฑ์รายเดือน",
      icon: Calendar,
      color: "bg-blue-500",
      type: "monthly",
    },
    {
      title: "รายงานผู้ใช้งาน",
      description: "สถิติผู้ใช้งานและการเข้าสู่ระบบ",
      icon: Users,
      color: "bg-green-500",
      type: "users",
    },
    {
      title: "รายงานครุภัณฑ์",
      description: "สถานะและการใช้งานครุภัณฑ์",
      icon: Package,
      color: "bg-purple-500",
      type: "inventory",
    },
    {
      title: "รายงานตามหน่วยงาน",
      description: "การใช้งานแยกตามหน่วยงาน",
      icon: Building2,
      color: "bg-orange-500",
      type: "departments",
    },
  ];

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">รายงาน</h1>
          <p className="text-gray-600">
            ดูสถิติ แนวโน้ม และส่งออกรายงานต่างๆ ของระบบ
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="detailed">รายงานละเอียด</TabsTrigger>
            <TabsTrigger value="export">ส่งออกรายงาน</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminSystemStats detailed />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    แนวโน้มการใช้งาน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">กราฟแนวโน้มจะแสดงที่นี่</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    รายงานสรุป
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">คำขอทั้งหมด</span>
                      <span className="font-medium">1,234 รายการ</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        อัตราการอนุมัติ
                      </span>
                      <span className="font-medium text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        เวลาเฉลี่ยในการอนุมัติ
                      </span>
                      <span className="font-medium">2.3 ชั่วโมง</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        ครุภัณฑ์ยอดนิยม
                      </span>
                      <span className="font-medium">เครื่องฉายภาพ</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {reportCards.map((report) => (
                <Card
                  key={report.type}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center`}
                      >
                        <report.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => handleExportReport(report.type)}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      ส่งออก
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ตัวเลือกการส่งออก</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">รูปแบบไฟล์</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        Excel
                      </Button>
                      <Button variant="outline" size="sm">
                        CSV
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">ช่วงเวลา</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        7 วันที่ผ่านมา
                      </Button>
                      <Button variant="outline" size="sm">
                        30 วันที่ผ่านมา
                      </Button>
                      <Button variant="outline" size="sm">
                        3 เดือนที่ผ่านมา
                      </Button>
                      <Button variant="outline" size="sm">
                        กำหนดเอง
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
