package models

import "time"

type Category struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    *string   `gorm:"type:uuid;index" json:"user_id"` // nil = system default, shared across all users
	Name      string    `gorm:"not null" json:"name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// DefaultCategories are seeded once at startup with user_id = NULL.
var DefaultCategories = []string{
	"Food", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other",
}
