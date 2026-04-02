package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/thinhtn3/bud/config"
	"github.com/thinhtn3/bud/db"
	"github.com/thinhtn3/bud/routes"
)

func main() {
	cfg := config.Load()

	db.Connect(cfg.DatabaseURL)
	db.Migrate()

	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	routes.Register(r, cfg)

	log.Printf("server starting on :%s (env: %s)", cfg.Port, cfg.AppEnv)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
