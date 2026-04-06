package models

import "time"

// Profile mirrors auth.users from Supabase. The ID is the user's auth UUID.
// Preference fields are stored here since it's a strict 1-to-1 with the user.
type Profile struct {
	ID          string    `gorm:"type:uuid;primaryKey" json:"id"`
	DisplayName string    `gorm:"column:display_name" json:"display_name"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`

	// Onboarding & preferences
	OnboardingCompleted bool     `gorm:"default:false" json:"onboarding_completed"`
	BudgetPeriod        string   `gorm:"type:text;default:''" json:"budget_period"`
	BudgetAmount        float64  `gorm:"type:decimal(12,2);default:0" json:"budget_amount"`
	CarryOverExcess     bool     `gorm:"default:false" json:"carry_over_excess"`
	MonthlyIncome       *float64 `gorm:"type:decimal(12,2)" json:"monthly_income"`
	Currency            string   `gorm:"type:text;default:'USD'" json:"currency"`
	FinancialGoals      string   `gorm:"type:text;not null;default:'[]'" json:"-"` // stored as JSON array string
	UpdatedAt           time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
