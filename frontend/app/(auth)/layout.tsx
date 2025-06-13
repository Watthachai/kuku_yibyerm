import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ - KU Asset",
  description: "เข้าสู่ระบบจัดการครุภัณฑ์ มหาวิทยาลัยเกษตรศาสตร์",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ku-green via-green-600 to-ku-green-dark">
      {children}
    </div>
  );
}
