package models

import "time"

type Category struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    string    `gorm:"type:uuid;not null;index" json:"user_id"`
	Name      string    `gorm:"not null" json:"name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// DefaultCategories are seeded for every new user on first login.
var DefaultCategories = []string{
	"Food", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other",
}
