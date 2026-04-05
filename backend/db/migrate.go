package db

import (
	"log"

	"github.com/thinhtn3/bud/models"
)

// Migrate runs AutoMigrate for all registered models.
// To add a new model: define it in models/, then append &models.YourModel{} below.
func Migrate() {
	err := DB.AutoMigrate(
		&models.Profile{},
		&models.Category{},
		&models.Transaction{},
		&models.Widget{},
	)
	if err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("migration complete")
}
