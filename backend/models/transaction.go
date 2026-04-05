package models

import "time"

// TransactionType distinguishes expenses from income entries.
type TransactionType string

const (
	TransactionTypeExpense TransactionType = "expense"
	TransactionTypeIncome  TransactionType = "income"
)

type Transaction struct {
	ID          string          `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID      string          `gorm:"type:uuid;not null;index"`
	Type        TransactionType `gorm:"type:text;not null"`
	Name        string          `gorm:"not null"`
	Description *string         `gorm:"type:text"`
	Amount      float64         `gorm:"type:decimal(12,2);not null"`
	Date        time.Time       `gorm:"type:date;not null"`
	CategoryID  *string         `gorm:"type:uuid"`
	CreatedAt   time.Time       `gorm:"autoCreateTime"`
}
