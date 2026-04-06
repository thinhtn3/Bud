package models

import "time"

type Widget struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    string    `gorm:"type:uuid;not null;uniqueIndex:idx_user_widget_type" json:"user_id"`
	Type      string    `gorm:"type:text;not null;uniqueIndex:idx_user_widget_type" json:"type"`
	Size      string    `gorm:"type:text;not null" json:"size"`
	Position  int       `gorm:"not null" json:"position"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
