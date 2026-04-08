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
		&models.CardAlias{},
		&models.Transaction{},
		&models.Widget{},
	)
	if err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("migration complete")

	seedDefaultCategories()
}

// seedDefaultCategories inserts system-level categories (user_id = NULL) once.
// Safe to run on every startup — skips any that already exist.
func seedDefaultCategories() {
	for _, name := range models.DefaultCategories {
		DB.Where(models.Category{Name: name, UserID: nil}).FirstOrCreate(&models.Category{Name: name, UserID: nil})
	}
	log.Println("default categories seeded")
}
