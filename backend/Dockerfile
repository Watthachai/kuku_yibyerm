# Use a lean Go image
FROM golang:1.22-alpine AS build

# Set the working directory inside the container
WORKDIR /src

# Copy the go.mod and go.sum files to download dependencies first
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of your application source code
COPY . .

# Build the application, targeting the main.go inside your cmd/server directory
# This creates a static binary at /app/server
RUN CGO_ENABLED=0 go build -o /app/server ./cmd/server

# --- Final Stage ---
# Use a minimal image for the final container to keep it small and secure
FROM scratch

# Copy the compiled binary from the build stage
COPY --from=build /app/server /app/server

# Expose the port that Railway will use.
# Your Go app must listen on the $PORT environment variable.
EXPOSE 8080

# The command to run when the container starts
ENTRYPOINT ["/app/server"]