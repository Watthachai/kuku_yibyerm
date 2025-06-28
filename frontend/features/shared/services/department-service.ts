import { getAuthHeaders } from "@/lib/api";

export interface DepartmentRaw {
  id: string;
  name_th: string;
  name_en?: string;
  code: string;
  type: "FACULTY" | "DIVISION";
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name_th: string;
  name_en?: string;
  code: string;
  type: "FACULTY" | "DIVISION";
  faculty?: string;
  facultyName?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent_id?: string;
}

export interface CreateDepartmentData {
  name: string;
  name_en?: string;
  code: string;
  type: "FACULTY" | "DIVISION";
  parent_id?: string;
  building?: string;
  description?: string;
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {
  is_active?: boolean;
}

class DepartmentServiceClass {
  private baseUrl =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080") +
    "/api/v1";

  async getAllDepartments(): Promise<Department[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/departments`, {
        method: "GET",
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch departments");
      const result = await response.json();
      const rawData: DepartmentRaw[] = result.data || result;

      // สร้าง Map ของ faculties สำหรับการ lookup
      const facultyMap = new Map<string, DepartmentRaw>();
      rawData.forEach((dept) => {
        if (dept.type === "FACULTY") {
          facultyMap.set(dept.id, dept);
        }
      });

      // แปลงข้อมูลและเชื่อมโยง faculty กับ division
      return rawData.map((dept) => ({
        ...dept,
        faculty:
          dept.type === "DIVISION" && dept.parent_id
            ? facultyMap.get(dept.parent_id)?.code || "ไม่ระบุคณะ"
            : dept.type === "FACULTY"
            ? dept.code
            : undefined,
        facultyName:
          dept.type === "DIVISION" && dept.parent_id
            ? facultyMap.get(dept.parent_id)?.name_th || "ไม่ระบุคณะ"
            : dept.type === "FACULTY"
            ? dept.name_th
            : undefined,
      }));
    } catch (error) {
      console.error("Failed to get departments:", error);
      return [];
    }
  }

  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    try {
      const headers = await getAuthHeaders();
      // Map fields ให้ตรงกับ backend DTO
      const payload: Record<string, unknown> = {
        code: data.code,
        name_th: data.name, // ใช้ name เป็น name_th
        name_en: data.name_en || "",
        type: data.type,
        parent_id: data.parent_id,
        is_active: true, // default เปิดใช้งาน
        building: data.building,
        description: data.description,
      };
      const response = await fetch(`${this.baseUrl}/admin/departments`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create department");
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Failed to create department:", error);
      throw error;
    }
  }

  async updateDepartment(
    id: string,
    data: UpdateDepartmentData
  ): Promise<Department> {
    try {
      const headers = await getAuthHeaders();
      // Map fields ให้ตรงกับ backend DTO
      const payload: Record<string, unknown> = {
        code: data.code,
        name_th: data.name,
        name_en: data.name_en || "",
        type: data.type,
        parent_id: data.parent_id,
        is_active: data.is_active,
        building: data.building,
        description: data.description,
      };
      const response = await fetch(`${this.baseUrl}/admin/departments/${id}`, {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update department");
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Failed to update department:", error);
      throw error;
    }
  }

  async deleteDepartment(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/admin/departments/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) throw new Error("Failed to delete department");
    } catch (error) {
      console.error("Failed to delete department:", error);
      throw error;
    }
  }

  async getFaculties(): Promise<Department[]> {
    const departments = await this.getAllDepartments();
    return departments.filter((dept) => dept.type === "FACULTY");
  }
}

export const DepartmentService = new DepartmentServiceClass();
