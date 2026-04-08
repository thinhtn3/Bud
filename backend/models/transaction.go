package models

import "time"

// TransactionType distinguishes expenses from income/reimbursement entries.
type TransactionType string

const (
	TransactionTypeExpense       TransactionType = "expense"
	TransactionTypeIncome        TransactionType = "income"
	TransactionTypeReimbursement TransactionType = "reimbursement"
)

type Transaction struct {
	ID          string          `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      string          `gorm:"type:uuid;not null;index:idx_transactions_user_date" json:"user_id"`
	Type        TransactionType `gorm:"type:text;not null" json:"type"`
	Name        string          `gorm:"not null" json:"name"`
	Description *string         `gorm:"type:text" json:"description"`
	Amount      float64         `gorm:"type:decimal(12,2);not null" json:"amount"`
	Date        time.Time       `gorm:"type:date;not null;index:idx_transactions_user_date,sort:desc" json:"date"`
	CategoryID  *string         `gorm:"type:uuid" json:"category_id"`
	CardAliasID *string         `gorm:"type:uuid" json:"card_alias_id"`
	CreatedAt   time.Time       `gorm:"autoCreateTime" json:"created_at"`
}
