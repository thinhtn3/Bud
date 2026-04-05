package models

import "time"

type Category struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    string    `gorm:"type:uuid;not null;index"`
	Name      string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

// DefaultCategories are seeded for every new user on first login.
var DefaultCategories = []string{
	"Food", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other",
}
