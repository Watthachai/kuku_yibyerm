ku-asset/
├── cmd/
│   └── main.go
├── internal/
│   ├── auth/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── model.go
│   ├── asset/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── model.go
│   ├── approval/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── model.go
│   └── repository/
│       ├── postgres.go
│       └── repository.go
├── pkg/
│   ├── config/
│   │   └── config.go
│   ├── middleware/
│   │   └── auth.go
│   └── utils/
│       └── utils.go
└── go.mod