package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/thinhtn3/bud/models"
	"gorm.io/gorm"
)

type TransactionHandler struct {
	db *gorm.DB
}

func NewTransactionHandler(db *gorm.DB) *TransactionHandler {
	return &TransactionHandler{db: db}
}

type createTransactionRequest struct {
	Type        models.TransactionType `json:"type" binding:"required,oneof=expense income reimbursement"`
	Name        string                 `json:"name" binding:"required"`
	Amount      float64                `json:"amount" binding:"required,gt=0"`
	Date        string                 `json:"date" binding:"required"`
	CategoryID  *string                `json:"category_id"`
	CardAliasID *string                `json:"card_alias_id"`
	Description *string                `json:"description"`
}

// POST /api/transactions
func (h *TransactionHandler) Create(c *gin.Context) {
	userID := c.GetString("userID")

	var req createTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, expected YYYY-MM-DD"})
		return
	}

	tx := models.Transaction{
		UserID:      userID,
		Type:        req.Type,
		Name:        req.Name,
		Amount:      req.Amount,
		Date:        date,
		CategoryID:  req.CategoryID,
		CardAliasID: req.CardAliasID,
		Description: req.Description,
	}

	if err := h.db.Create(&tx).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create transaction"})
		return
	}

	c.JSON(http.StatusCreated, tx)
}

// GET /api/transactions/quick-add
// Returns recurring transactions (same name+type appearing >1 time) and 5 most recent distinct ones.
func (h *TransactionHandler) QuickAdd(c *gin.Context) {
	userID := c.GetString("userID")

	type nameTypePair struct {
		Name string
		Type string
	}

	// Recurring: (name, type) combos appearing more than once
	var recurringPairs []nameTypePair
	h.db.Raw(`
		SELECT name, type
		FROM transactions
		WHERE user_id = ?
		GROUP BY name, type
		HAVING COUNT(*) > 1
		ORDER BY COUNT(*) DESC
		LIMIT 5
	`, userID).Scan(&recurringPairs)

	// Most recent instance of each recurring combo (as the pre-fill template)
	recurring := make([]models.Transaction, 0)
	for _, p := range recurringPairs {
		var tx models.Transaction
		if err := h.db.Where("user_id = ? AND name = ? AND type = ?", userID, p.Name, p.Type).
			Order("date desc, created_at desc").
			First(&tx).Error; err == nil {
			recurring = append(recurring, tx)
		}
	}

	// Recent: 5 most recent transactions not already covered by recurring
	recent := make([]models.Transaction, 0)
	q := h.db.Where("user_id = ?", userID)
	if len(recurringPairs) > 0 {
		names := make([]string, len(recurringPairs))
		for i, p := range recurringPairs {
			names[i] = p.Name
		}
		q = q.Where("name NOT IN ?", names)
	}
	q.Order("date desc, created_at desc").Limit(5).Find(&recent)

	c.JSON(http.StatusOK, gin.H{
		"recurring": recurring,
		"recent":    recent,
	})
}

// PATCH /api/transactions/:id
func (h *TransactionHandler) Update(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	var tx models.Transaction
	if err := h.db.Where("id = ? AND user_id = ?", id, userID).First(&tx).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
		return
	}

	var req createTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, expected YYYY-MM-DD"})
		return
	}

	tx.Type = req.Type
	tx.Name = req.Name
	tx.Amount = req.Amount
	tx.Date = date
	tx.CategoryID = req.CategoryID
	tx.CardAliasID = req.CardAliasID
	tx.Description = req.Description

	if err := h.db.Save(&tx).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update transaction"})
		return
	}

	c.JSON(http.StatusOK, tx)
}

// DELETE /api/transactions/:id
func (h *TransactionHandler) Delete(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	result := h.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Transaction{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete transaction"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
		return
	}

	c.Status(http.StatusNoContent)
}

// GET /api/transactions
// Optional query params: type, category_id, from (YYYY-MM-DD), to (YYYY-MM-DD)
func (h *TransactionHandler) List(c *gin.Context) {
	userID := c.GetString("userID")

	query := h.db.Where("user_id = ?", userID)

	if t := c.Query("type"); t != "" {
		query = query.Where("type = ?", t)
	}
	if cat := c.Query("category_id"); cat != "" {
		query = query.Where("category_id = ?", cat)
	}
	if from := c.Query("from"); from != "" {
		query = query.Where("date >= ?", from)
	}
	if to := c.Query("to"); to != "" {
		query = query.Where("date <= ?", to)
	}

	var transactions []models.Transaction
	if err := query.Order("date desc, created_at desc").Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch transactions"})
		return
	}

	c.JSON(http.StatusOK, transactions)
}
