package models

import "time"

// Profile mirrors auth.users from Supabase. The ID is the user's auth UUID.
type Profile struct {
	ID          string    `gorm:"type:uuid;primaryKey" json:"id"`
	DisplayName string    `gorm:"column:display_name" json:"display_name"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}
