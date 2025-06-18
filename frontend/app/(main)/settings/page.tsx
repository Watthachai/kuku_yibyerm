"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/guards/admin-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Mail,
  Shield,
  Database,
  Bell,
  Globe,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    // General Settings
    siteName: "KU Asset Management",
    siteDescription: "ระบบจัดการครุภัณฑ์ มหาวิทยาลัยเกษตรศาสตร์",
    adminEmail: "admin@ku.ac.th",
    timezone: "Asia/Bangkok",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationSound: true,

    // Security Settings
    sessionTimeout: "60",
    passwordMinLength: "8",
    requireTwoFactor: false,
    allowGoogleLogin: true,

    // System Settings
    maxFileSize: "10",
    backupFrequency: "daily",
    logRetention: "30",
    maintenanceMode: false,
  });

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      // TODO: Call API to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "บันทึกสำเร็จ",
        description: `การตั้งค่า${section}ได้รับการบันทึกแล้ว`,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
          <p className="text-gray-600">
            จัดการการตั้งค่าระบบ ความปลอดภัย และการแจ้งเตือน
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">ทั่วไป</TabsTrigger>
            <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
            <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
            <TabsTrigger value="system">ระบบ</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  การตั้งค่าทั่วไป
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">ชื่อเว็บไซต์</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) =>
                        updateSetting("siteName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">อีเมลผู้ดูแลระบบ</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) =>
                        updateSetting("adminEmail", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">คำอธิบายเว็บไซต์</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) =>
                      updateSetting("siteDescription", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">เขตเวลา</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => updateSetting("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Bangkok">
                        Asia/Bangkok (UTC+7)
                      </SelectItem>
                      <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={() => handleSave("ทั่วไป")} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกการตั้งค่า
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  การตั้งค่าการแจ้งเตือน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">
                      การแจ้งเตือนทางอีเมล
                    </Label>
                    <p className="text-sm text-gray-600">
                      รับการแจ้งเตือนผ่านอีเมล
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      updateSetting("emailNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">
                      การแจ้งเตือนทาง SMS
                    </Label>
                    <p className="text-sm text-gray-600">
                      รับการแจ้งเตือนผ่าน SMS
                    </p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) =>
                      updateSetting("smsNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">
                      การแจ้งเตือนแบบ Push
                    </Label>
                    <p className="text-sm text-gray-600">
                      รับการแจ้งเตือนบนเบราว์เซอร์
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      updateSetting("pushNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificationSound">เสียงการแจ้งเตือน</Label>
                    <p className="text-sm text-gray-600">
                      เปิดเสียงเมื่อมีการแจ้งเตือน
                    </p>
                  </div>
                  <Switch
                    id="notificationSound"
                    checked={settings.notificationSound}
                    onCheckedChange={(checked) =>
                      updateSetting("notificationSound", checked)
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSave("การแจ้งเตือน")}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกการตั้งค่า
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  การตั้งค่าความปลอดภัย
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">
                      หมดเวลาการเข้าสู่ระบบ (นาที)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) =>
                        updateSetting("sessionTimeout", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">
                      ความยาวรหัสผ่านขั้นต่ำ
                    </Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) =>
                        updateSetting("passwordMinLength", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireTwoFactor">
                      การยืนยันตัวตนสองขั้นตอน
                    </Label>
                    <p className="text-sm text-gray-600">
                      บังคับใช้ 2FA สำหรับผู้ดูแลระบบ
                    </p>
                  </div>
                  <Switch
                    id="requireTwoFactor"
                    checked={settings.requireTwoFactor}
                    onCheckedChange={(checked) =>
                      updateSetting("requireTwoFactor", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowGoogleLogin">
                      อนุญาตการเข้าสู่ระบบด้วย Google
                    </Label>
                    <p className="text-sm text-gray-600">
                      ให้ผู้ใช้เข้าสู่ระบบด้วยบัญชี Google
                    </p>
                  </div>
                  <Switch
                    id="allowGoogleLogin"
                    checked={settings.allowGoogleLogin}
                    onCheckedChange={(checked) =>
                      updateSetting("allowGoogleLogin", checked)
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSave("ความปลอดภัย")}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกการตั้งค่า
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  การตั้งค่าระบบ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">ขนาดไฟล์สูงสุด (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={settings.maxFileSize}
                      onChange={(e) =>
                        updateSetting("maxFileSize", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logRetention">เก็บ Log (วัน)</Label>
                    <Input
                      id="logRetention"
                      type="number"
                      value={settings.logRetention}
                      onChange={(e) =>
                        updateSetting("logRetention", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">ความถี่การสำรองข้อมูล</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) =>
                      updateSetting("backupFrequency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">ทุกชั่วโมง</SelectItem>
                      <SelectItem value="daily">ทุกวัน</SelectItem>
                      <SelectItem value="weekly">ทุกสัปดาห์</SelectItem>
                      <SelectItem value="monthly">ทุกเดือน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">โหมดบำรุงรักษา</Label>
                    <p className="text-sm text-gray-600">
                      ปิดระบบเพื่อบำรุงรักษา
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      updateSetting("maintenanceMode", checked)
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleSave("ระบบ")} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    บันทึกการตั้งค่า
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast({
                        title: "กำลังพัฒนา",
                        description: "ฟีเจอร์นี้จะเพิ่มในเร็วๆ นี้",
                      })
                    }
                  >
                    <Database className="w-4 h-4 mr-2" />
                    สำรองข้อมูล
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
