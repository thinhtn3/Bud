package models

import "time"

// WidgetType identifies which prebuilt stat island a widget renders.
type WidgetType string

const (
	WidgetTypeTotalBalance       WidgetType = "total_balance"
	WidgetTypeTotalIncome        WidgetType = "total_income"
	WidgetTypeTotalExpenses      WidgetType = "total_expenses"
	WidgetTypeSpendingSummary    WidgetType = "spending_summary"
	WidgetTypeCategoryBreakdown  WidgetType = "category_breakdown"
	WidgetTypeRecentTransactions WidgetType = "recent_transactions"
	WidgetTypeGroupDebts         WidgetType = "group_debts"
)

type Widget struct {
	ID        string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    string     `gorm:"type:uuid;not null;index"`
	Type      WidgetType `gorm:"type:text;not null"`
	PosX      int        `gorm:"not null"`
	PosY      int        `gorm:"not null"`
	W         int        `gorm:"not null"`
	H         int        `gorm:"not null"`
	CreatedAt time.Time  `gorm:"autoCreateTime"`
}
