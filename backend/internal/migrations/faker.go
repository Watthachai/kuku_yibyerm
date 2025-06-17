package migrations

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/go-faker/faker/v4"
)

// generateID generates a unique ID with prefix
func generateID(prefix string) string {
	timestamp := time.Now().Unix()
	random := rand.Intn(10000)
	return fmt.Sprintf("%s%d%04d", prefix, timestamp, random)
}

// generateRequestNumber generates a unique request number
func generateRequestNumber() string {
	now := time.Now()
	year := now.Year()
	month := now.Month()
	day := now.Day()
	random := rand.Intn(10000)

	return fmt.Sprintf("REQ%04d%02d%02d%04d", year, month, day, random)
}

// FakeProductData generates fake product data
type FakeProductData struct {
	Name        string
	Description string
	Code        string
	Price       float64
	Location    string
}

// GenerateFakeProduct creates fake product data
func GenerateFakeProduct(categoryPrefix string, index int) FakeProductData {
	rand.Seed(time.Now().UnixNano())

	return FakeProductData{
		Name:        generateProductName(categoryPrefix),
		Description: faker.Sentence(),
		Code:        fmt.Sprintf("%s%03d-2024", categoryPrefix, index),
		Price:       float64(rand.Intn(50000) + 1000), // 1,000 - 51,000 บาท
		Location:    generateLocation(),
	}
}

// generateProductName creates realistic product names based on category
func generateProductName(categoryPrefix string) string {
	switch categoryPrefix {
	case "EP": // เครื่องฉาย
		brands := []string{"Epson", "BenQ", "Optoma", "Sony", "Canon"}
		models := []string{"EB-X41", "MS527", "HD146X", "VPL-EX455", "LV-X420"}
		return fmt.Sprintf("เครื่องฉายภาพ %s %s",
			brands[rand.Intn(len(brands))],
			models[rand.Intn(len(models))])

	case "SH": // ไมโครโฟน
		brands := []string{"Shure", "Audio-Technica", "Sennheiser", "AKG", "Rode"}
		models := []string{"SM58", "ATR2100x", "e835", "D5", "PodMic"}
		return fmt.Sprintf("ไมโครโฟน %s %s",
			brands[rand.Intn(len(brands))],
			models[rand.Intn(len(models))])

	case "HP": // เครื่องพิมพ์
		brands := []string{"HP", "Canon", "Epson", "Brother", "Lexmark"}
		models := []string{"LaserJet Pro", "PIXMA", "EcoTank", "MFC-L2750DW", "MS431dw"}
		return fmt.Sprintf("เครื่องพิมพ์ %s %s",
			brands[rand.Intn(len(brands))],
			models[rand.Intn(len(models))])

	case "CM": // กล้องถ่ายรูป
		brands := []string{"Canon", "Nikon", "Sony", "Fujifilm", "Olympus"}
		models := []string{"EOS R6", "D750", "A7 III", "X-T4", "OM-D E-M1"}
		return fmt.Sprintf("กล้องถ่ายรูป %s %s",
			brands[rand.Intn(len(brands))],
			models[rand.Intn(len(models))])

	case "CP": // คอมพิวเตอร์
		brands := []string{"Dell", "HP", "Lenovo", "ASUS", "Acer"}
		models := []string{"Inspiron", "Pavilion", "ThinkPad", "VivoBook", "Aspire"}
		return fmt.Sprintf("แล็ปท็อป %s %s",
			brands[rand.Intn(len(brands))],
			models[rand.Intn(len(models))])

	case "ST": // เครื่องเขียน
		items := []string{
			"ปากกาเมจิก", "กระดาษ A4", "ไฟล์เก็บเอกสาร", "ลูกแม็ก",
			"สติกเกอร์โน้ต", "คลิปหนีบกระดาษ", "ลวดเย็บกระดาษ", "ยางลบ",
			"ดินสอ HB", "ปากกาลูกลื่น", "เทปใส", "กาวแท่ง",
		}
		units := []string{"แพค", "กล่อง", "ห่อ", "ชุด"}
		return fmt.Sprintf("%s (%s %d)",
			items[rand.Intn(len(items))],
			units[rand.Intn(len(units))],
			rand.Intn(10)+1)

	case "EL": // อุปกรณ์ไฟฟ้า
		items := []string{
			"ปลั๊กพ่วง", "ถ่าน AA", "สาย USB", "อแดปเตอร์",
			"หัวแปลง HDMI", "สายไฟ", "เต้าเสียบ", "สวิตช์",
			"ฟิวส์", "รีเลย์", "หลอดไฟ LED", "ปลั๊กไฟ",
		}
		specs := []string{"6 ช่อง", "อัลคาไลน์", "Type-C", "65W", "to VGA", "3 เมตร", "20W", "16A"}
		return fmt.Sprintf("%s %s",
			items[rand.Intn(len(items))],
			specs[rand.Intn(len(specs))])

	default:
		return faker.Word() + " " + faker.Word()
	}
}

// generateLocation creates realistic location names
func generateLocation() string {
	buildings := []string{"อาคาร A", "อาคาร B", "อาคาร C", "อาคารเรียนรวม", "อาคารปฏิบัติการ"}
	floors := []string{"ชั้น 1", "ชั้น 2", "ชั้น 3", "ชั้น 4"}
	rooms := []string{"ห้อง 101", "ห้อง 201", "ห้อง 301", "ห้องประชุม", "ห้องเก็บของ", "คลังพัสดุ"}

	return fmt.Sprintf("%s %s %s",
		rooms[rand.Intn(len(rooms))],
		floors[rand.Intn(len(floors))],
		buildings[rand.Intn(len(buildings))])
}

// GenerateFakeUser creates fake user data
func GenerateFakeUser() map[string]interface{} {
	genders := []string{"male", "female"}
	gender := genders[rand.Intn(len(genders))]

	var firstName, lastName string
	if gender == "male" {
		firstName = faker.FirstNameMale()
		lastName = faker.LastName()
	} else {
		firstName = faker.FirstNameFemale()
		lastName = faker.LastName()
	}

	return map[string]interface{}{
		"first_name":  firstName,
		"last_name":   lastName,
		"email":       faker.Email(),
		"phone":       generateThaiPhoneNumber(),
		"student_id":  generateStudentID(),
		"employee_id": generateEmployeeID(),
		"gender":      gender,
		"birth_date":  generateBirthDate(),
		"address":     faker.GetRealAddress().Address,
		"created_at":  time.Now(),
		"updated_at":  time.Now(),
	}
}

// generateThaiPhoneNumber creates realistic Thai phone numbers
func generateThaiPhoneNumber() string {
	prefixes := []string{"08", "09", "06", "02"}
	prefix := prefixes[rand.Intn(len(prefixes))]

	if prefix == "02" {
		// Bangkok landline
		return fmt.Sprintf("02-%d-%d",
			rand.Intn(900)+100,
			rand.Intn(9000)+1000)
	} else {
		// Mobile
		return fmt.Sprintf("%s-%d-%d",
			prefix,
			rand.Intn(900)+100,
			rand.Intn(9000)+1000)
	}
}

// generateStudentID creates realistic student IDs
func generateStudentID() string {
	year := rand.Intn(6) + 2019 // 2019-2024
	faculty := rand.Intn(20) + 1
	number := rand.Intn(9000) + 1000

	return fmt.Sprintf("%d%02d%04d", year, faculty, number)
}

// generateEmployeeID creates realistic employee IDs
func generateEmployeeID() string {
	return fmt.Sprintf("EMP%06d", rand.Intn(999999)+1)
}

// generateBirthDate creates realistic birth dates
func generateBirthDate() time.Time {
	start := time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
	end := time.Date(2005, 12, 31, 0, 0, 0, 0, time.UTC)

	delta := end.Sub(start)
	randomDuration := time.Duration(rand.Int63n(int64(delta)))

	return start.Add(randomDuration)
}
