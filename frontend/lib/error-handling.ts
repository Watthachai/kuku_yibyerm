// lib/error-handling.ts
export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

// ⭐ Retry logic สำหรับ API calls
export async function retryFetch(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  delayMs = 1000
): Promise<Response> {
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // ถ้าสำเร็จ หรือ error ที่ไม่ควร retry (400, 401, 403, 404)
      if (response.ok || [400, 401, 403, 404].includes(response.status)) {
        return response;
      }

      throw new ApiError(`HTTP ${response.status}`, response.status);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      // ถ้าเป็นครั้งสุดท้าย หรือ error ที่ไม่ควร retry
      if (attempt === maxRetries || error instanceof ApiError) {
        break;
      }

      console.warn(
        `API call failed (attempt ${attempt}/${maxRetries}):`,
        error
      );

      // รอก่อน retry
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
}

// ⭐ Safe API call wrapper
export async function safeApiCall<T>(
  apiFunction: () => Promise<T>,
  fallbackValue: T,
  errorMessage = "API call failed"
): Promise<T> {
  try {
    return await apiFunction();
  } catch (error) {
    console.error(errorMessage, error);
    return fallbackValue;
  }
}

// ⭐ Network connectivity check
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function getNetworkErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return "ไม่สามารถเชื่อมต่อเครือข่ายได้";
  }

  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return "กรุณาเข้าสู่ระบบใหม่";
      case 403:
        return "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้";
      case 404:
        return "ไม่พบข้อมูลที่ต้องการ";
      case 429:
        return "ขอข้อมูลบ่อยเกินไป กรุณารอสักครู่";
      case 500:
        return "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์";
      default:
        return error.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
    }
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes("ERR_CONNECTION_REFUSED")) {
    return "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
  }

  if (errorMessage.includes("TypeError")) {
    return "เกิดข้อผิดพลาดในการประมวลผลข้อมูล";
  }

  return "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
}
