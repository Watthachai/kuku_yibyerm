"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  FileText,
  Users,
  Shield,
  Package,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Smartphone,
    title: "เบิกจ่ายออนไลน์",
    description:
      "ขั้นตอนการเบิกครุภัณฑ์ที่รวดเร็ว สะดวก ผ่านระบบออนไลน์ตลอด 24 ชั่วโมง",
  },
  {
    icon: FileText,
    title: "อนุมัติแบบขั้นตอน",
    description:
      "ระบบอนุมัติที่ชัดเจน ตั้งแต่หัวหน้าภาควิชาไปจนถึงเจ้าหน้าที่พัสดุกลาง",
  },
  {
    icon: Users,
    title: "จัดการผู้ใช้",
    description:
      "ระบบจัดการสิทธิ์ผู้ใช้ 3 ระดับ: ผู้ใช้ทั่วไป หัวหน้าภาควิชา และผู้ดูแลระบบ",
  },
  {
    icon: Shield,
    title: "ความปลอดภัย",
    description:
      "ระบบรักษาความปลอดภัยระดับสูง รองรับการเข้าใช้งานด้วย Email มหาวิทยาลัยเท่านั้น",
  },
  {
    icon: CheckCircle,
    title: "รายงานและสถิติ",
    description:
      "ระบบรายงานและสถิติการใช้งานที่ครอบคลุม เพื่อการวางแผนและบริหารจัดการ",
  },
];

export function LandingFeatures() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="py-24 bg-white/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ฟีเจอร์หลักของระบบ
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            ออกแบบมาเพื่อตอบสนองความต้องการการจัดการครุภัณฑ์ของมหาวิทยาลัยอย่างครบครัน
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-white/80 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
