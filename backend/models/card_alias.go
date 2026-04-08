package models

import "time"

type CardAlias struct {
	ID          string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      string    `gorm:"type:uuid;not null;index" json:"user_id"`
	CardName    string    `gorm:"not null" json:"card_name"`
	CardType    string    `gorm:"type:text;not null" json:"card_type"`    // e.g., "credit", "debit"
	CardNetwork string    `gorm:"type:text;not null" json:"card_network"` // e.g., "visa", "mastercard", "amex"
	Last4       *string   `gorm:"type:varchar(4)" json:"last4"`           // Optional
	Expiry      *string   `gorm:"type:text" json:"expiry"`                // Optional
	Color       string    `gorm:"type:text" json:"color"`                 // UI customization
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
