# Dockerfile

# Stage 1: Build the Go application
FROM golang:1.24.4 AS build

# ⭐⭐⭐ นี่คือบรรทัดที่แก้ไขปัญหา Certificate ทั้งหมด ⭐⭐⭐
# สำหรับ Debian-based image (เช่น golang:1.24.4) ให้ใช้ apt-get
RUN apt-get update && apt-get install -y ca-certificates

# ... ส่วนที่เหลือของ Dockerfile ของคุณ (copy, build, etc.) ...
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# คำสั่ง build ของคุณ
RUN CGO_ENABLED=0 go build -o /app/server ./cmd/server

# Stage 2: Create a minimal final image
FROM alpine:latest

# ⭐⭐⭐ ติดตั้ง ca-certificates ใน final image ด้วย ⭐⭐⭐
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy the binary from the build stage
COPY --from=build /app/server /app/server

# Copy timezone data (ถ้ามี)
COPY --from=build /usr/share/zoneinfo /usr/share/zoneinfo
ENV TZ=Asia/Bangkok

EXPOSE 8080
ENTRYPOINT ["/app/server"]