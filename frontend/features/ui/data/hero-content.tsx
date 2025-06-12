import { BookOpen, Sparkles, ArrowRight, Play } from "lucide-react";
import type { HeroContent } from "../types/hero";

export const heroContent: HeroContent = {
  badge: {
    icon: (
      <div className="relative">
        <BookOpen className="w-5 h-5" />
        <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-ping" />
      </div>
    ),
    text: "มหาวิทยาลัยเกษตรศาสตร์",
  },
  title: {
    main: "ระบบจัดการ",
    highlight: "การยืม-คืน",
    subtitle: "สำหรับบุคลากร",
  },
  description:
    "ระบบจัดการการยืม-คืนอุปกรณ์และทรัพยากรศึกษา สำหรับเจ้าหน้าที่ อาจารย์ และผู้ดูแลระบบ",
  highlight: "จัดการได้ง่าย ตรวจสอบได้ทุกที่ ทุกเวลา",
  actions: [
    {
      label: "เข้าสู่ระบบ",
      href: "/sign-in",
      variant: "primary" as const,
      icon: (
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      ),
    },
    {
      label: "ดูคู่มือการใช้งาน",
      variant: "secondary" as const,
      icon: <Play className="mr-2 w-5 h-5" />,
    },
  ],
  statusMessage: "ระบบสำหรับบุคลากร จัดการการยืม-คืนได้อย่างมีประสิทธิภาพ",
};
