import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageCircle, Handshake, RotateCcw } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "ค้นหาของใช้",
    description: "เลือกของใช้ที่ต้องการจากรายการในแอป",
    step: "01",
  },
  {
    icon: MessageCircle,
    title: "ติดต่อเจ้าของ",
    description: "แชทคุยกับเจ้าของเพื่อนัดหมายเวลารับ",
    step: "02",
  },
  {
    icon: Handshake,
    title: "ยืม-ใช้งาน",
    description: "พบกันตามนัดหมาย รับของใช้และเริ่มใช้งาน",
    step: "03",
  },
  {
    icon: RotateCcw,
    title: "คืนของใช้",
    description: "คืนของใช้ตามกำหนด และให้คะแนนกัน",
    step: "04",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            วิธีใช้งาน YibYerm
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            เพียง 4 ขั้นตอนง่ายๆ คุณก็สามารถยืมของใช้ที่ต้องการได้แล้ว
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-emerald-200 transform translate-x-4" />
                )}

                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    {/* Step Number */}
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-600 text-white rounded-full text-sm font-bold mb-4">
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-6">
                      <step.icon className="w-8 h-8" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
