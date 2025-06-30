import { getAuthHeaders } from "@/lib/api";
import { CONFIG } from "@/lib/config";

// Department Types
export interface Department {
  id: string; // Keep as string for frontend form handling, convert when needed
  name: string;
  building?: string;
  faculty?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Add numeric id for backend compatibility
  numeric_id?: number;
}

export interface Faculty {
  id: string;
  name: string;
  short_name: string;
  description?: string;
  departments: Department[];
}

// Backend response types (ถ้า backend ส่งมาแตกต่าง)
interface BackendDepartment {
  id: number;
  code: string;
  name_th: string;
  name_en: string;
  type: string;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: BackendDepartment[];
}

class DepartmentService {
  private baseUrl = CONFIG.API_BASE_URL;

  // Get all faculties with departments
  async getFaculties(): Promise<Faculty[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/faculties`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        // ถ้า API ยังไม่พร้อม ให้ return mock data
        console.warn("Faculties API not implemented yet, using mock data");
        return this.getMockFaculties();
      }

      const result = await response.json();
      const backendData = result.data || result;

      // แปลงข้อมูลจาก backend format เป็น frontend format
      return this.transformBackendData(backendData);
    } catch (error) {
      console.error("Failed to get faculties:", error);
      // Return mock data for development
      return this.getMockFaculties();
    }
  }

  // แปลงข้อมูลจาก backend ให้เป็นรูปแบบที่ frontend ต้องการ
  private transformBackendData(backendData: BackendDepartment[]): Faculty[] {
    return backendData.map((faculty) => ({
      id: faculty.id.toString(), // ใช้ numeric id แปลงเป็น string
      name: faculty.name_th,
      short_name: faculty.code,
      description: faculty.name_en,
      departments: (faculty.children || []).map((dept) => ({
        id: dept.id.toString(), // ใช้ numeric id แปลงเป็น string
        name: dept.name_th,
        building: dept.name_en, // ใช้ name_en เป็น building ชั่วคราว
        faculty: faculty.name_th,
        description: dept.name_en,
        is_active: dept.is_active,
        created_at: dept.created_at,
        updated_at: dept.updated_at,
      })),
    }));
  }

  // Get departments by faculty
  async getDepartmentsByFaculty(facultyId: string): Promise<Department[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/faculties/${facultyId}/departments`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get departments:", error);
      return [];
    }
  }

  // Mock data for development (จะลบออกเมื่อ backend พร้อม)
  private getMockFaculties(): Faculty[] {
    return [
      {
        id: "1",
        name: "คณะเกษตร",
        short_name: "เกษตร",
        description: "คณะเกษตรเป็นคณะที่เก่าแก่ที่สุดของมหาวิทยาลัยเกษตรศาสตร์",
        departments: [
          {
            id: "1",
            name: "ภาควิชาพืชไร่",
            building: "อาคารพืชไร่",
            faculty: "คณะเกษตร",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "2",
            name: "ภาควิชาพืชสวน",
            building: "อาคารพืชสวน",
            faculty: "คณะเกษตร",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "3",
            name: "ภาควิชาปฐพีวิทยา",
            building: "อาคารปฐพีวิทยา",
            faculty: "คณะเกษตร",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "4",
            name: "ภาควิชากีฏวิทยา",
            building: "อาคารกีฏวิทยา",
            faculty: "คณะเกษตร",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "5",
            name: "ภาควิชาโรคพืช",
            building: "อาคารโรคพืช",
            faculty: "คณะเกษตร",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "2",
        name: "คณะวิศวกรรมศาสตร์",
        short_name: "วิศวะ",
        description: "คณะที่ผลิตวิศวกรคุณภาพสูงเพื่อพัฒนาประเทศ",
        departments: [
          {
            id: "6",
            name: "ภาควิชาวิศวกรรมโยธา",
            building: "อาคารวิศวกรรม 1",
            faculty: "คณะวิศวกรรมศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "7",
            name: "ภาควิชาวิศวกรรมเครื่องกล",
            building: "อาคารวิศวกรรม 2",
            faculty: "คณะวิศวกรรมศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "8",
            name: "ภาควิชาวิศวกรรมไฟฟ้า",
            building: "อาคารวิศวกรรม 3",
            faculty: "คณะวิศวกรรมศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "9",
            name: "ภาควิชาวิศวกรรมเคมี",
            building: "อาคารวิศวกรรมเคมี",
            faculty: "คณะวิศวกรรมศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "10",
            name: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
            building: "อาคารคอมพิวเตอร์",
            faculty: "คณะวิศวกรรมศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "3",
        name: "คณะวิทยาศาสตร์",
        short_name: "วิทย์",
        description: "คณะที่มุ่งมั่นในการพัฒนาความรู้ทางวิทยาศาสตร์",
        departments: [
          {
            id: "11",
            name: "ภาควิชาคณิตศาสตร์",
            building: "อาคารวิทยาศาสตร์",
            faculty: "คณะวิทยาศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "12",
            name: "ภาควิชาฟิสิกส์",
            building: "อาคารฟิสิกส์",
            faculty: "คณะวิทยาศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "13",
            name: "ภาควิชาเคมี",
            building: "อาคารเคมี",
            faculty: "คณะวิทยาศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "14",
            name: "ภาควิชาชีววิทยา",
            building: "อาคารชีววิทยา",
            faculty: "คณะวิทยาศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "15",
            name: "ภาควิชาจุลชีววิทยา",
            building: "อาคารจุลชีววิทยา",
            faculty: "คณะวิทยาศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "liberal",
        name: "คณะศิลปศาสตร์",
        short_name: "ศิลป์",
        description: "คณะที่ให้ความรู้ด้านภาษาและวัฒนธรรม",
        departments: [
          {
            id: "lib-thai",
            name: "ภาควิชาภาษาไทย",
            building: "อาคารศิลปศาสตร์ 1",
            faculty: "คณะศิลปศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "lib-eng",
            name: "ภาควิชาภาษาอังกฤษ",
            building: "อาคารศิลปศาสตร์ 2",
            faculty: "คณะศิลปศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "lib-japanese",
            name: "ภาควิชาภาษาญี่ปุ่น",
            building: "อาคารศิลปศาสตร์ 2",
            faculty: "คณะศิลปศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "lib-german",
            name: "ภาควิชาภาษาเยอรมัน",
            building: "อาคารศิลปศาสตร์ 2",
            faculty: "คณะศิลปศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "economics",
        name: "คณะเศรษฐศาสตร์",
        short_name: "เศรษฐ์",
        description: "คณะที่เป็นผู้นำด้านเศรษฐศาสตร์และการจัดการ",
        departments: [
          {
            id: "econ-general",
            name: "ภาควิชาเศรษฐศาสตร์",
            building: "อาคารเศรษฐศาสตร์",
            faculty: "คณะเศรษฐศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "econ-coop",
            name: "ภาควิชาสหกรณ์",
            building: "อาคารสหกรณ์",
            faculty: "คณะเศรษฐศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "econ-agri-economics",
            name: "ภาควิชาเศรษฐศาสตร์เกษตร",
            building: "อาคารเศรษฐศาสตร์เกษตร",
            faculty: "คณะเศรษฐศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "education",
        name: "คณะศึกษาศาสตร์",
        short_name: "ศึกษา",
        description: "คณะที่พัฒนาครูและบุคลากรทางการศึกษา",
        departments: [
          {
            id: "edu-general",
            name: "ภาควิชาการศึกษา",
            building: "อาคารศึกษาศาสตร์",
            faculty: "คณะศึกษาศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "edu-curriculum",
            name: "ภาควิชาหลักสูตรและการสอน",
            building: "อาคารศึกษาศาสตร์",
            faculty: "คณะศึกษาศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "social",
        name: "คณะสังคมศาสตร์",
        short_name: "สังคม",
        description: "คณะที่ศึกษาพฤติกรรมและสังคมมนุษย์",
        departments: [
          {
            id: "social-dev",
            name: "ภาควิชาพัฒนาสังคม",
            building: "อาคารสังคมศาสตร์",
            faculty: "คณะสังคมศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "social-rural",
            name: "ภาควิชาสังคมวิทยาและมานุษยวิทยา",
            building: "อาคารสังคมศาสตร์",
            faculty: "คณะสังคมศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "humanities",
        name: "คณะมนุษยศาสตร์",
        short_name: "มนุษย์",
        description: "คณะที่ส่งเสริมความรู้ด้านมนุษยศาสตร์",
        departments: [
          {
            id: "hum-history",
            name: "ภาควิชาประวัติศาสตร์",
            building: "อาคารมนุษยศาสตร์",
            faculty: "คณะมนุษยศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "hum-philosophy",
            name: "ภาควิชาปรัชญา",
            building: "อาคารมนุษยศาสตร์",
            faculty: "คณะมนุษยศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "forestry",
        name: "คณะวนศาสตร์",
        short_name: "วนศาสตร์",
        description: "คณะที่อนุรักษ์และจัดการทรัพยากรป่าไม้",
        departments: [
          {
            id: "for-general",
            name: "ภาควิชาวนศาสตร์",
            building: "อาคารวนศาสตร์",
            faculty: "คณะวนศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "for-conservation",
            name: "ภาควิชาอนุรักษ์วิทยา",
            building: "อาคารวนศาสตร์",
            faculty: "คณะวนศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "fisheries",
        name: "คณะประมง",
        short_name: "ประมง",
        description: "คณะที่เชี่ยวชาญด้านประมงและทรัพยากรน้ำ",
        departments: [
          {
            id: "fish-general",
            name: "ภาควิชาประมง",
            building: "อาคารประมง",
            faculty: "คณะประมง",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "fish-aquaculture",
            name: "ภาควิชาเพาะเลี้ยงสัตว์น้ำ",
            building: "อาคารเพาะเลี้ยงสัตว์น้ำ",
            faculty: "คณะประมง",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "veterinary",
        name: "คณะสัตวแพทยศาสตร์",
        short_name: "สัตวแพทย์",
        description: "คณะที่ผลิตสัตวแพทย์เพื่อดูแลสุขภาพสัตว์",
        departments: [
          {
            id: "vet-general",
            name: "ภาควิชาสัตวแพทยศาสตร์คลินิก",
            building: "อาคารสัตวแพทย์",
            faculty: "คณะสัตวแพทยศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "vet-pathology",
            name: "ภาควิชาพยาธิวิทยา",
            building: "อาคารสัตวแพทย์",
            faculty: "คณะสัตวแพทยศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "vet-anatomy",
            name: "ภาควิชากายวิภาคศาสตร์",
            building: "อาคารสัตวแพทย์",
            faculty: "คณะสัตวแพทยศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "architecture",
        name: "คณะสถาปัตยกรรมศาสตร์",
        short_name: "สถาปัตย์",
        description: "คณะที่สร้างสรรค์และออกแบบสภาพแวดล้อม",
        departments: [
          {
            id: "arch-general",
            name: "ภาควิชาสถาปัตยกรรม",
            building: "อาคารสถาปัตยกรรม",
            faculty: "คณะสถาปัตยกรรมศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
          {
            id: "arch-landscape",
            name: "ภาควิชาสถาปัตยกรรมภูมิทัศน์",
            building: "อาคารสถาปัตยกรรม",
            faculty: "คณะสถาปัตยกรรมศาสตร์",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "home-economics",
        name: "คณะเศรษฐศาสตร์ครัวเรือน",
        short_name: "เศรษฐศาสตร์ครัวเรือน",
        description: "คณะที่พัฒนาคุณภาพชีวิตและครอบครัว",
        departments: [
          {
            id: "home-general",
            name: "ภาควิชาเศรษฐศาสตร์ครัวเรือน",
            building: "อาคารเศรษฐศาสตร์ครัวเรือน",
            faculty: "คณะเศรษฐศาสตร์ครัวเรือน",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
      {
        id: "environment",
        name: "คณะสิ่งแวดล้อม",
        short_name: "สิ่งแวดล้อม",
        description: "คณะที่ดูแลและจัดการสิ่งแวดล้อม",
        departments: [
          {
            id: "env-science",
            name: "ภาควิชาวิทยาศาสตร์สิ่งแวดล้อม",
            building: "อาคารสิ่งแวดล้อม",
            faculty: "คณะสิ่งแวดล้อม",
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ],
      },
    ];
  }
}

export const departmentService = new DepartmentService();
