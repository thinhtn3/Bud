package models

import "time"

// Group represents a shared expense group.
type Group struct {
	ID         string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name       string    `gorm:"not null" json:"name"`
	CreatedBy  string    `gorm:"type:uuid;not null" json:"created_by"`
	InviteCode string    `gorm:"type:text;not null;uniqueIndex" json:"invite_code"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// GroupMember links a user to a group. Unique on (group_id, user_id).
type GroupMember struct {
	ID       string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	GroupID  string    `gorm:"type:uuid;not null;uniqueIndex:idx_group_member" json:"group_id"`
	UserID   string    `gorm:"type:uuid;not null;uniqueIndex:idx_group_member" json:"user_id"`
	JoinedAt time.Time `gorm:"autoCreateTime" json:"joined_at"`
}

// GroupExpense is a single shared expense within a group.
type GroupExpense struct {
	ID          string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	GroupID     string    `gorm:"type:uuid;not null;index" json:"group_id"`
	PaidBy      string    `gorm:"type:uuid;not null" json:"paid_by"`
	Name        string    `gorm:"not null" json:"name"`
	Amount      float64   `gorm:"type:decimal(12,2);not null" json:"amount"`
	Date        time.Time `gorm:"type:date;not null" json:"date"`
	Description *string   `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// GroupExpenseSplit records one member's share of a GroupExpense.
type GroupExpenseSplit struct {
	ID        string  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ExpenseID string  `gorm:"type:uuid;not null;index" json:"expense_id"`
	UserID    string  `gorm:"type:uuid;not null" json:"user_id"`
	Amount    float64 `gorm:"type:decimal(12,2);not null" json:"amount"`
}

// GroupSettlement records a direct payment between two group members.
type GroupSettlement struct {
	ID         string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	GroupID    string    `gorm:"type:uuid;not null;index" json:"group_id"`
	FromUserID string    `gorm:"type:uuid;not null" json:"from_user_id"` // who paid
	ToUserID   string    `gorm:"type:uuid;not null" json:"to_user_id"`   // who received
	Amount     float64   `gorm:"type:decimal(12,2);not null" json:"amount"`
	Date       time.Time `gorm:"type:date;not null" json:"date"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
}
