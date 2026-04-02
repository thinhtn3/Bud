package models

import "time"

// Profile mirrors auth.users from Supabase. The ID is the user's auth UUID.
type Profile struct {
	ID          string    `gorm:"type:uuid;primaryKey"`
	DisplayName string    `gorm:"column:display_name;not null;uniqueIndex"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}
