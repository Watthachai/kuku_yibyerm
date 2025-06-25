/**
 * Utility functions for product image search
 * @description เครื่องมือช่วยค้นหารูปภาพสินค้าจาก Unsplash API
 */

// พจนานุกรมแปลภาษาไทยเป็นอังกฤษสำหรับสินค้า/ครุภัณฑ์
const THAI_TO_ENGLISH_DICT: { [key: string]: string } = {
  // เครื่องใช้สำนักงาน
  ยางลบ: "eraser",
  ดินสอ: "pencil",
  ปากกา: "pen",
  กระดาษ: "paper",
  สมุด: "notebook",
  แฟ้ม: "folder",
  คลิป: "paper clip",
  ที่เย็บกระดาษ: "stapler",
  กรรไกร: "scissors",
  ไม้บรรทัด: "ruler",

  // เครื่องคอมพิวเตอร์
  คอมพิวเตอร์: "computer",
  โน๊ตบุ๊ค: "laptop",
  แล็ปท็อป: "laptop",
  เมาส์: "mouse",
  คีย์บอร์ด: "keyboard",
  จอภาพ: "monitor",
  หน้าจอ: "monitor",
  เครื่องพิมพ์: "printer",
  สแกนเนอร์: "scanner",
  เว็บแคม: "webcam",
  ลำโพง: "speaker",
  หูฟัง: "headphone",

  // เครื่องใช้ไฟฟ้า
  พัดลม: "fan",
  แอร์: "air conditioner",
  เครื่องปรับอากาศ: "air conditioner",
  ตู้เย็น: "refrigerator",
  ไมโครเวฟ: "microwave",
  เตาอบ: "oven",
  กาต้มน้ำ: "kettle",
  โทรทัศน์: "television",
  ทีวี: "television",

  // เฟอร์นิเจอร์
  โต๊ะ: "desk table",
  เก้าอี้: "chair",
  ตู้: "cabinet",
  ชั้นวาง: "shelf",
  ที่นั่ง: "seat",
  โซฟา: "sofa",

  // อุปกรณ์การแพทย์
  เทอร์โมมิเตอร์: "thermometer",
  หลอดเลือด: "syringe",
  หน้ากาก: "mask",
  ถุงมือ: "gloves",

  // อื่นๆ
  กล้อง: "camera",
  โทรศัพท์: "phone",
  มือถือ: "mobile phone",
  นาฬิกา: "clock watch",
  ตาชั่ง: "scale",
  เครื่องชั่ง: "scale",
};

/**
 * แปลงชื่อสินค้าภาษาไทยเป็นคำค้นหาภาษาอังกฤษ
 * @param productName ชื่อสินค้าภาษาไทย
 * @returns คำค้นหาภาษาอังกฤษ
 */
export function translateProductNameToSearchTerm(productName: string): string {
  if (!productName || productName.length < 3) {
    return "";
  }

  // ทำความสะอาดชื่อสินค้า (ลบคำที่ไม่จำเป็น)
  const cleanedName = productName
    .replace(/เครื่อง|อุปกรณ์|ครุภัณฑ์|ที่|สำหรับ/g, "")
    .trim();

  // ค้นหาคำแปลในพจนานุกรม
  for (const [thai, english] of Object.entries(THAI_TO_ENGLISH_DICT)) {
    if (cleanedName.includes(thai)) {
      return english;
    }
  }

  // ถ้าไม่เจอคำแปล ใช้คำเดิมและเพิ่มคำทั่วไป
  const firstWord = cleanedName.split(" ")[0];
  return `${firstWord} office equipment supply`;
}

/**
 * ค้นหารูปภาพจาก Unsplash API
 * @param searchTerm คำค้นหา
 * @param accessKey Unsplash Access Key
 * @returns Promise array ของ URL รูปภาพ
 */
export async function searchImagesFromUnsplash(
  searchTerm: string,
  accessKey: string
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        searchTerm
      )}&per_page=4&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.results.map(
        (img: { urls: { small: string } }) => img.urls.small
      );
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    console.error("Failed to fetch images from Unsplash:", error);
    throw error;
  }
}

/**
 * รูปภาพ placeholder สำหรับกรณีที่ API ล้มเหลว
 */
export const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop", // Computer
  "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop", // Office equipment
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop", // Generic office
  "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=300&fit=crop", // Equipment
];

/**
 * Unsplash Access Key (ควรเก็บใน environment variables)
 */
export const UNSPLASH_ACCESS_KEY =
  "O6wGEj4ioivLUUXgs9lasxEQ39OKg6_1NKpHpOp2cX4";
