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
	ID        string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    string     `gorm:"type:uuid;not null;index" json:"user_id"`
	Type      WidgetType `gorm:"type:text;not null" json:"type"`
	PosX      int        `gorm:"not null" json:"pos_x"`
	PosY      int        `gorm:"not null" json:"pos_y"`
	W         int        `gorm:"not null" json:"w"`
	H         int        `gorm:"not null" json:"h"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
}
