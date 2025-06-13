.PHONY: run dev build test test-coverage deps clean fmt lint docker-build docker-run migrate-create migrate-up migrate-down

# Development
run:
	@echo "🚀 Starting server..."
	go run cmd/server/main.go

dev:
	@echo "🔥 Starting with hot reload..."
	air

# Build
build:
	@echo "🔨 Building application..."
	go build -o bin/server cmd/server/main.go

# Database Migration
migrate-create:
	@read -p "Enter migration name: " name; \
	go run cmd/migrate/main.go $$name

migrate-up:
	@echo "📊 Running migrations..."
	go run cmd/server/main.go -migrate

migrate-down:
	@echo "⏪ Rolling back migrations..."
	@read -p "Enter migration ID to rollback to: " id; \
	go run cmd/server/main.go -rollback=$$id

# Testing
test:
	@echo "🧪 Running tests..."
	go test ./...

test-coverage:
	@echo "📊 Running tests with coverage..."
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

# Utilities
deps:
	@echo "📦 Installing dependencies..."
	go mod tidy
	go mod download

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf bin/
	rm -rf tmp/
	go clean

fmt:
	@echo "🎨 Formatting code..."
	go fmt ./...

lint:
	@echo "🔍 Running linter..."
	golangci-lint run

# Docker
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t kuku-yipyerm-backend .

docker-run:
	@echo "🐳 Running Docker container..."
	docker run -p 8080:8080 kuku-yipyerm-backend
