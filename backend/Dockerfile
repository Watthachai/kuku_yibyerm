# --- Build Stage ---
FROM golang:1.24.4 AS build
WORKDIR /app

# Copy go mod and sum first for better cache
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the backend source
COPY . .

# Build the Go server (main.go อยู่ที่ cmd/server)
RUN CGO_ENABLED=0 go build -o /app/server ./cmd/server

# --- Final Stage ---
FROM scratch
WORKDIR /app
COPY --from=build /app/server /app/server
COPY --from=build /usr/share/zoneinfo /usr/share/zoneinfo
EXPOSE 8080
ENTRYPOINT ["/app/server"]