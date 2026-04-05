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
	Type        models.TransactionType `json:"type" binding:"required,oneof=expense income"`
	Name        string                 `json:"name" binding:"required"`
	Amount      float64                `json:"amount" binding:"required,gt=0"`
	Date        string                 `json:"date" binding:"required"`
	CategoryID  *string                `json:"category_id"`
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
		Description: req.Description,
	}

	if err := h.db.Create(&tx).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create transaction"})
		return
	}

	c.JSON(http.StatusCreated, tx)
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
