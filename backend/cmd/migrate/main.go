package main

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/thinhtn3/bud/config"
	"github.com/thinhtn3/bud/db"
)

func main() {
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("no .env file found, using environment variables")
	}

	cfg := config.Load()
	db.Connect(cfg.DatabaseURL)
	db.Migrate()
}
