# KU Asset Management - Business Flow & Integration Guide

## 📋 สรุป Business Flow

### 1. User Login Flow

```
User เข้าสู่ระบบ → ตรวจสอบ Profile Completion → แสดง First-time Setup (ถ้าจำเป็น) → Dashboard
```

**รายละเอียด:**

1. User login ผ่าน Google OAuth
2. ระบบตรวจสอบ `localStorage.hasSeenFirstTimeSetup`
3. ตรวจสอบ User Profile ว่าข้อมูลครบหรือไม่
4. ถ้าไม่ครบ และไม่เคยเห็น Setup → แสดง First-time Setup
5. ถ้าครับแล้ว หรือเคยเห็นแล้ว → ไปหน้า Dashboard

### 2. First-time Setup Flow

```
Step 1: ข้อมูลพื้นฐาน → Step 2: เลือกคณะ → Step 3: เลือกแผนก → ยืนยัน → เสร็จสิ้น
```

**รายละเอียด:**

- **Step 1:** กรอกชื่อ (required), เบอร์โทร (optional)
- **Step 2:** เลือกคณะ (required)
- **Step 3:** เลือกภาควิชา/หน่วยงาน (optional, ขึ้นอยู่กับคณะที่เลือก)
- **Confirmation:** แสดงข้อมูลสรุป เพื่อยืนยัน
- **Complete:** บันทึกข้อมูล → ตั้งค่า localStorage → redirect ไป Dashboard

### 3. Profile Management Flow

```
Profile Page → Edit Profile → Faculty/Department Selection → Update → Success
```

**รายละเอียด:**

- User สามารถแก้ไขข้อมูลได้ทุกเวลาผ่าน Profile Page
- การเลือก Faculty/Department เป็น Dynamic จาก API
- รองรับ Nested Selection (เลือกคณะก่อน แล้วจึงเลือกภาควิชา)

## 🔧 Technical Implementation

### API Endpoints ที่ใช้

```
✅ GET  /api/v1/profile              - ดึงข้อมูล User Profile
✅ PUT  /api/v1/profile              - อัปเดต User Profile
🚧 GET  /api/v1/profile/stats        - ดึงสถิติ User (ใช้ mock data)
🚧 GET  /api/v1/faculties            - ดึงข้อมูลคณะและภาควิชา (ใช้ mock data)
❌ GET  /api/v1/auth/me              - ไม่มี (ใช้ /profile แทน)
❌ GET  /api/v1/users/stats          - ไม่มี (ใช้ /profile/stats แทน)
```

### Key Components

```
✅ FirstTimeSetup                    - Multi-step setup wizard
✅ EditProfileModal                  - Profile editing with Faculty/Dept selection
✅ FirstTimeSetupWrapper            - Guard component for automatic setup
✅ useProfileCompletion             - Hook ตรวจสอบ profile completion
✅ userService                      - User API calls
✅ departmentService                - Faculty/Department API calls (with mock data)
```

### Data Flow

```
Session → useProfileCompletion → FirstTimeSetupWrapper → FirstTimeSetup/Dashboard
      ↓
   userService.getCurrentUser()
      ↓
   departmentService.getFaculties()
      ↓
   Component State Management
```

## 📱 Integration Options

### Option A: ใช้ FirstTimeSetupWrapper (แนะนำ)

```tsx
// ใน Layout หลัก
import { FirstTimeSetupWrapper } from "@/components/guards/first-time-setup-guard";

export default function MobileLayout({ children }) {
  return <FirstTimeSetupWrapper>{children}</FirstTimeSetupWrapper>;
}
```

### Option B: Manual Check ใน Page

```tsx
// ใน specific page
import { useFirstTimeSetupState } from "@/components/guards/first-time-setup-guard";

export default function DashboardPage() {
  const { shouldShowSetup, isLoading } = useFirstTimeSetupState();

  if (isLoading) return <Loading />;
  if (shouldShowSetup) return <FirstTimeSetup />;

  return <Dashboard />;
}
```

### Option C: Route Level Protection

```tsx
// ใน middleware.ts (Advanced)
export function middleware(request: NextRequest) {
  // ตรวจสอบ session และ profile completion
  // redirect ไป setup page ถ้าจำเป็น
}
```

## 🗂️ State Management

### localStorage Keys

```typescript
"hasSeenFirstTimeSetup": "true" | null    // ว่าเคยเห็น setup แล้วหรือไม่
```

### Profile Completion Criteria

```typescript
interface ProfileCompletionCheck {
  name: required; // ต้องมีชื่อ
  email: auto_from_oauth; // ได้จาก OAuth อัตโนมัติ
  department_id: optional; // ไม่บังคับแต่แนะนำ
}
```

## 🎯 Business Rules

### การแสดง First-time Setup

1. **ต้องเข้าเงื่อนไข:**

   - User login แล้ว (มี session)
   - ไม่เคยเห็น Setup (`!hasSeenFirstTimeSetup`)
   - Profile ไม่ครบถ้วน (`!profile.name`)
   - ไม่อยู่ในสถานะ loading

2. **ไม่แสดง Setup เมื่อ:**
   - ยังไม่ได้ login
   - เคยเห็น Setup แล้ว
   - Profile ครบถ้วนแล้ว
   - เกิด Error ในการโหลดข้อมูล

### การจัดการ Faculty/Department

1. **Faculty Selection:**

   - ใช้ข้อมูลจาก `departmentService.getFaculties()`
   - รองรับทั้ง real API และ mock data
   - แสดงชื่อเต็มและชื่อย่อ

2. **Department Selection:**
   - Dependent บน Faculty ที่เลือก
   - แสดงชื่อภาควิชาและอาคาร
   - สามารถเลือก "ไม่ระบุ" ได้

## 🚀 Next Steps

### สำหรับ Backend Developer:

1. **Implement Missing API Endpoints:**

   ```go
   GET  /api/v1/profile/stats     // User statistics
   GET  /api/v1/faculties         // Faculty and departments data
   ```

2. **เพิ่ม Routes ใน backend/routes/routes.go:**

   ```go
   // เพิ่มใน setupProtectedRoutes
   profile.GET("/stats", c.User.GetUserStats)

   // เพิ่ม faculties endpoint
   group.GET("/faculties", c.Department.GetFaculties)
   ```

### สำหรับ Frontend Developer:

1. **เพิ่ม First-time Setup Integration:**

   ```tsx
   // ใน app/mobile/layout.tsx หรือ app/(main)/layout.tsx
   import { FirstTimeSetupWrapper } from "@/components/guards/first-time-setup-guard";

   return <FirstTimeSetupWrapper>{children}</FirstTimeSetupWrapper>;
   ```

2. **Test Integration:**
   - ทดสอบ flow การ login ครั้งแรก
   - ทดสอบการ skip setup
   - ทดสอบการแก้ไข profile
   - ทดสอบ Faculty/Department selection

### สำหรับ Product Owner:

1. **Define Business Rules:**

   - กำหนดว่า field ไหนบังคับ field ไหนไม่บังคับ
   - กำหนด validation rules
   - กำหนด error handling strategy

2. **UX Considerations:**
   - ควรให้ skip setup ได้หรือไม่?
   - ควรบังคับ department selection หรือไม่?
   - จะจัดการ user ที่ไม่มี faculty/department ยังไง?

## 📊 Current Status

✅ **Completed:**

- First-time Setup UI/UX
- Profile Edit Modal with Faculty/Dept selection
- API Integration with fallback to mock data
- Profile completion detection
- State management and guards

🚧 **In Progress:**

- Backend API endpoints
- Full integration testing

❌ **Pending:**

- Production deployment
- User acceptance testing
- Performance optimization

---

_อัปเดตล่าสุด: 24 มิถุนายน 2025_
