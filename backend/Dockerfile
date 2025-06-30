# Dockerfile

# --- STAGE 1: Build Stage ---
# ใช้ Go image ตัวเต็มที่มีเครื่องมือครบครัน
FROM golang:1.24.4 AS build

# ติดตั้ง CA-Certificates สำหรับการเชื่อมต่อ HTTPS
RUN apt-get update && apt-get install -y ca-certificates

# ตั้งค่า Working Directory
WORKDIR /app

# Copy และ download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy โค้ดทั้งหมด
COPY . .

# ⭐ Add cache buster for fresh builds
RUN echo "Backend build at: $(date)" > /tmp/build-time

# Build Go application
RUN CGO_ENABLED=0 go build -o /app/server ./cmd/server

# --- STAGE 2: Final Stage ---
# ใช้ Alpine image ที่มีขนาดเล็กมากสำหรับ Production
FROM alpine:latest

# ⭐⭐⭐ นี่คือ 2 บรรทัดที่เพิ่มเข้ามาเพื่อแก้ปัญหา TimeZone ⭐⭐⭐
# 1. ติดตั้ง ca-certificates และ tzdata (timezone data)
RUN apk --no-cache add ca-certificates tzdata

# 2. ตั้งค่า Environment Variable สำหรับ TimeZone โดยตรง
ENV TZ=Asia/Bangkok
# ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐

WORKDIR /app

# Copy แค่โปรแกรมที่ build เสร็จแล้วจาก Stage 1 มาใช้งาน
COPY --from=build /app/server /app/server

# บอกให้รู้ว่า Container จะทำงานที่ port 8080
EXPOSE 8080

# คำสั่งสุดท้ายในการรันโปรแกรม
ENTRYPOINT ["/app/server"]