package app

import (
	"log"

	"kuku-yipyerm/internal/config"
	"kuku-yipyerm/internal/database"
	"kuku-yipyerm/internal/migrations"
	"kuku-yipyerm/internal/routes"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type App struct {
	Router *gin.Engine
	DB     *gorm.DB
	Config *config.Config
}

// Initialize sets up the application
func Initialize() (*App, error) {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		return nil, err
	}

	// Initialize database
	db, err := database.Connect(cfg.Database)
	if err != nil {
		return nil, err
	}

	// Run migrations
	if err := migrations.AutoMigrate(db); err != nil {
		log.Printf("Migration error: %v", err)
		return nil, err
	}
	log.Println("✅ Database migrations completed")

	// Setup router
	router := routes.SetupRouter(db)

	app := &App{
		Router: router,
		DB:     db,
		Config: cfg,
	}

	log.Println("✅ Application initialized successfully")
	return app, nil
}

// Run starts the HTTP server
func (a *App) Run() error {
	log.Printf("🚀 Server starting on port %s", a.Config.Server.Port)
	return a.Router.Run(":" + a.Config.Server.Port)
}

// Shutdown gracefully shuts down the application
func (a *App) Shutdown() error {
	sqlDB, err := a.DB.DB()
	if err == nil {
		sqlDB.Close()
	}

	log.Println("👋 Application shutdown completed")
	return nil
}
