backend/
├── cmd/
│ ├── server/
│ │ └── main.go # Entry point เท่านั้น
│ └── migrate/
│ └── main.go # Migration CLI
├── internal/
│ ├── app/
│ │ ├── app.go # Application setup
│ │ └── server.go # Server configuration
│ ├── config/
│ │ ├── config.go # Configuration management
│ │ ├── database.go # Database config
│ │ └── env.go # Environment variables
│ ├── database/
│ │ ├── connection.go # DB connection
│ │ └── migrations.go # Migration runner
│ ├── domain/
│ │ ├── auth/
│ │ │ ├── handler.go # Auth HTTP handlers
│ │ │ ├── service.go # Auth business logic
│ │ │ ├── repository.go # Auth data access
│ │ │ └── types.go # Auth DTOs/Types
│ │ ├── user/
│ │ │ ├── handler.go # User HTTP handlers
│ │ │ ├── service.go # User business logic
│ │ │ ├── repository.go # User data access
│ │ │ └── types.go # User DTOs/Types
│ │ └── oauth/
│ │ ├── handler.go # OAuth handlers
│ │ ├── service.go # OAuth logic
│ │ └── types.go # OAuth types
│ ├── middleware/
│ │ ├── auth.go # JWT middleware
│ │ ├── cors.go # CORS middleware
│ │ ├── logger.go # Logging middleware
│ │ └── recovery.go # Recovery middleware
│ ├── models/
│ │ ├── user.go # User model
│ │ └── common.go # Common model interfaces
│ ├── pkg/
│ │ ├── jwt/
│ │ │ ├── generator.go # JWT generation
│ │ │ ├── validator.go # JWT validation
│ │ │ └── types.go # JWT types
│ │ ├── hash/
│ │ │ └── password.go # Password hashing
│ │ └── response/
│ │ └── response.go # Standard API responses
│ ├── routes/
│ │ ├── routes.go # Main router
│ │ ├── auth.go # Auth routes
│ │ ├── user.go # User routes
│ │ └── health.go # Health check routes
│ └── migrations/
│ ├── migrate.go # Migration registry
│ └── files/
│ ├── 001_create_users.go
│ └── 002_add_oauth_fields.go
├── scripts/
│ ├── migrate.sh # Migration scripts
│ └── seed.sh # Seeding scripts
├── .env.example
├── .gitignore
├── go.mod
├── go.sum
├── Makefile
└── README.md
