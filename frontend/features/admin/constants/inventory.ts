export const INVENTORY_CATEGORIES = [
  { value: "electronics", label: "อุปกรณ์อิเล็กทรอนิกส์" },
  { value: "furniture", label: "เฟอร์นิเจอร์" },
  { value: "vehicles", label: "ยานพาหนะ" },
  { value: "tools", label: "เครื่องมือ" },
  { value: "medical", label: "อุปกรณ์การแพทย์" },
  { value: "sports", label: "อุปกรณ์กีฬา" },
  { value: "laboratory", label: "อุปกรณ์ห้องปฏิบัติการ" },
  { value: "other", label: "อื่นๆ" },
] as const;

export const INVENTORY_CONDITIONS = [
  { value: "NEW", label: "ใหม่", color: "bg-emerald-500" },
  { value: "GOOD", label: "ดี", color: "bg-green-500" },
  { value: "FAIR", label: "ปานกลาง", color: "bg-yellow-500" },
  { value: "POOR", label: "แย่", color: "bg-orange-500" },
  { value: "DAMAGED", label: "เสียหาย", color: "bg-red-500" },
] as const;

export const INVENTORY_STATUSES = [
  { value: "AVAILABLE", label: "พร้อมใช้งาน", color: "bg-green-500" },
  { value: "IN_USE", label: "กำลังใช้งาน", color: "bg-blue-500" },
  { value: "MAINTENANCE", label: "ซ่อมบำรุง", color: "bg-yellow-500" },
  { value: "RETIRED", label: "เลิกใช้", color: "bg-gray-500" },
] as const;

export const BUILDINGS = [
  { value: "building-1", label: "อาคาร 1" },
  { value: "building-2", label: "อาคาร 2" },
  { value: "building-3", label: "อาคาร 3" },
  { value: "library", label: "อาคารห้องสมุด" },
  { value: "science", label: "อาคารวิทยาศาสตร์" },
  { value: "engineering", label: "อาคารวิศวกรรม" },
] as const;

export const DEPARTMENTS = [
  { value: "agri", label: "คณะเกษตร" },
  { value: "eng", label: "คณะวิศวกรรมศาสตร์" },
  { value: "sci", label: "คณะวิทยาศาสตร์" },
  { value: "edu", label: "คณะศึกษาศาสตร์" },
  { value: "lib", label: "ห้องสมุด" },
  { value: "admin", label: "ส่วนบริหาร" },
] as const;
