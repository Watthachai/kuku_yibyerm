"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Building2,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  userService,
  UpdateUserProfileRequest,
} from "../../services/user-service";
import { departmentService, Faculty } from "../../services/department-service";

interface FirstTimeSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface SetupData {
  name: string;
  phone: string;
  faculty_id: string;
  department_id: string;
}

export function FirstTimeSetup({ onComplete, onSkip }: FirstTimeSetupProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  const [setupData, setSetupData] = useState<SetupData>({
    name: session?.user?.name || "",
    phone: "",
    faculty_id: "none",
    department_id: "none",
  });

  // Load faculties
  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const data = await departmentService.getFaculties();
        setFaculties(data);
      } catch (error) {
        console.error("Failed to load faculties:", error);
        toast.error("ไม่สามารถโหลดข้อมูลคณะได้");
      }
    };

    loadFaculties();
  }, []);

  // Update selected faculty when faculty_id changes
  useEffect(() => {
    if (setupData.faculty_id && setupData.faculty_id !== "none") {
      const faculty = faculties.find((f) => f.id === setupData.faculty_id);
      setSelectedFaculty(faculty || null);
      // Reset department when faculty changes
      setSetupData((prev) => ({ ...prev, department_id: "none" }));
    } else {
      setSelectedFaculty(null);
    }
  }, [setupData.faculty_id, faculties]);

  const totalSteps = 3;
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  const handleNext = () => {
    if (currentStep === 1 && !setupData.name.trim()) {
      toast.error("กรุณากรอกชื่อของคุณ");
      return;
    }

    if (
      currentStep === 2 &&
      (!setupData.faculty_id || setupData.faculty_id === "none")
    ) {
      toast.error("กรุณาเลือกคณะ");
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const updateData: UpdateUserProfileRequest = {
        name: setupData.name.trim(),
      };

      if (setupData.phone.trim()) {
        updateData.phone = setupData.phone.trim();
      }

      if (setupData.department_id && setupData.department_id !== "none") {
        updateData.department_id = parseInt(setupData.department_id);
      }

      await userService.updateProfile(updateData);
      toast.success("ตั้งค่าโปรไฟล์เสร็จสิ้น!");
      onComplete();
    } catch (error) {
      console.error("Failed to complete setup:", error);
      toast.error("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  ยินดีต้อนรับ!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  มาตั้งค่าโปรไฟล์ของคุณกันเถอะ
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  ชื่อของคุณ *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={setupData.name}
                  onChange={(e) =>
                    setSetupData({ ...setupData, name: e.target.value })
                  }
                  className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50"
                  placeholder="กรอกชื่อจริงของคุณ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  เบอร์โทรศัพท์ (ไม่บังคับ)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={setupData.phone}
                  onChange={(e) =>
                    setSetupData({ ...setupData, phone: e.target.value })
                  }
                  className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50"
                  placeholder="02-123-4567 หรือ 09X-XXX-XXXX"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  เลือกคณะของคุณ
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  เพื่อให้เราจัดการครุภัณฑ์ได้ตรงกับหน่วยงาน
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  คณะ *
                </Label>
                <Select
                  value={setupData.faculty_id}
                  onValueChange={(value) =>
                    setSetupData({ ...setupData, faculty_id: value })
                  }
                >
                  <SelectTrigger className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50">
                    <SelectValue placeholder="เลือกคณะของคุณ" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-slate-700/50">
                    <SelectItem value="none">เลือกคณะ</SelectItem>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFaculty && selectedFaculty.departments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ภาควิชา/หน่วยงาน (ไม่บังคับ)
                  </Label>
                  <Select
                    value={setupData.department_id}
                    onValueChange={(value) =>
                      setSetupData({ ...setupData, department_id: value })
                    }
                  >
                    <SelectTrigger className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50">
                      <SelectValue placeholder="เลือกภาควิชา/หน่วยงาน" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border border-gray-200/50 dark:border-slate-700/50">
                      <SelectItem value="none">ไม่ระบุ</SelectItem>
                      {selectedFaculty.departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          <div className="flex flex-col items-start">
                            <span>{dept.name}</span>
                            {dept.building && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {dept.building}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        const selectedDepartment = selectedFaculty?.departments.find(
          (d) => d.id === setupData.department_id
        );

        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  ยืนยันข้อมูล
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  ตรวจสอบข้อมูลของคุณก่อนเสร็จสิ้น
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 space-y-3">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      ชื่อ
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {setupData.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      เบอร์โทรศัพท์
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {setupData.phone || "ไม่ได้ระบุ"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      คณะ
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedFaculty?.name || "ไม่ได้ระบุ"}
                    </p>
                  </div>
                </div>

                {selectedDepartment && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        ภาควิชา/หน่วยงาน
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedDepartment.name}
                      </p>
                      {selectedDepartment.building && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedDepartment.building}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50/60 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
                  ข้อมูลเหล่านี้จะช่วยให้เราจัดการครุภัณฑ์ได้ดีขึ้น
                  <br />
                  คุณสามารถแก้ไขได้ทุกเวลาในหน้าโปรไฟล์
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ตั้งค่าเริ่มต้น
            </CardTitle>
          </div>
          <CardDescription>
            ขั้นตอนที่ {currentStep} จาก {totalSteps}
          </CardDescription>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {renderStepContent()}

          <div className="flex gap-3 mt-8">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isLoading}
                className="flex-1 bg-gray-50/60 dark:bg-slate-700/60 backdrop-blur-sm border-gray-200/50 dark:border-slate-600/50 hover:bg-gray-50/80 dark:hover:bg-slate-700/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ย้อนกลับ
              </Button>
            )}

            {isFirstStep && onSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                disabled={isLoading}
                className="flex-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ข้ามไป
              </Button>
            )}

            <Button
              onClick={isLastStep ? handleComplete : handleNext}
              disabled={isLoading}
              className={`${
                isFirstStep ? "w-full" : "flex-1"
              } bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : isLastStep ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {isLastStep ? "เสร็จสิ้น" : "ถัดไป"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
