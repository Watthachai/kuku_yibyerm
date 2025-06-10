import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-emerald-400" />
              <span className="text-2xl font-bold">YibYerm</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              แพลตฟอร์มยืม-คืนของใช้สำหรับนักศึกษามหาวิทยาลัยเกษตรศาสตร์
              สร้างชุมชนแชร์ริ่งที่ยั่งยืน
            </p>
            <div className="text-emerald-400 text-sm">
              © 2025 YibYerm. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">ลิงก์ด่วน</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  วิธีใช้งาน
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  กฎการใช้งาน
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  ความปลอดภัย
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  คำถามที่พบบ่อย
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">ติดต่อเรา</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@yibyerm.ku.ac.th</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">02-942-8200</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span className="text-sm">
                  มหาวิทยาลัยเกษตรศาสตร์
                  <br />
                  กรุงเทพฯ 10900
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
