# Dockerfile

# --- STAGE 1: Build Stage ---
# ใช้ Go image ตัวเต็มที่มีเครื่องมือครบครัน
FROM golang:1.24.4 AS build

# ⭐ ติดตั้ง CA-Certificates ใน Build Stage (ใช้ apt-get)
RUN apt-get update && apt-get install -y ca-certificates

# ตั้งค่า Working Directory
WORKDIR /app

# Copy และ download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy โค้ดทั้งหมด
COPY . .

# Build Go application
# CGO_ENABLED=0 เพื่อให้ build เป็น static binary
RUN CGO_ENABLED=0 go build -o /app/server ./cmd/server

# --- STAGE 2: Final Stage ---
# ใช้ Alpine image ที่มีขนาดเล็กมากสำหรับ Production
FROM alpine:latest

# ⭐ ติดตั้ง CA-Certificates ใน Final Stage ด้วย (ใช้ apk)
# เพื่อให้แอปที่รันอยู่สามารถเชื่อมต่อ HTTPS ไปข้างนอกได้
RUN apk --no-cache add ca-certificates

# ตั้งค่า Working Directory
WORKDIR /app

# Copy แค่โปรแกรมที่ build เสร็จแล้วจาก Stage 1 มาใช้งาน
COPY --from=build /app/server /app/server

# Copy timezone data (ถ้าคุณใช้)
# COPY --from=build /usr/share/zoneinfo /usr/share/zoneinfo
# ENV TZ=Asia/Bangkok

# บอกให้รู้ว่า Container จะทำงานที่ port 8080
EXPOSE 8080

# คำสั่งสุดท้ายในการรันโปรแกรม
ENTRYPOINT ["/app/server"]