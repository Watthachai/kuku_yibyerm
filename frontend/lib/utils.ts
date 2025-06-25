import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type Item = {
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "DAMAGED";
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusStyle = (status: Item["status"]) => {
  switch (status) {
    case "AVAILABLE":
      return { text: "พร้อมใช้งาน", color: "bg-green-100 text-green-800" };
    case "IN_USE":
      return { text: "กำลังใช้งาน", color: "bg-blue-100 text-blue-800" };
    case "MAINTENANCE":
      return { text: "ซ่อมบำรุง", color: "bg-yellow-100 text-yellow-800" };
    case "DAMAGED":
      return { text: "ชำรุด", color: "bg-red-100 text-red-800" };
    default:
      return { text: status, color: "bg-gray-100 text-gray-800" };
  }
};
