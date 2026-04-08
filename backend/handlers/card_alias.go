package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/thinhtn3/bud/models"
	"gorm.io/gorm"
)

type CardAliasHandler struct {
	db *gorm.DB
}

func NewCardAliasHandler(db *gorm.DB) *CardAliasHandler {
	return &CardAliasHandler{db: db}
}

type cardAliasRequest struct {
	CardName    string  `json:"card_name" binding:"required"`
	CardType    string  `json:"card_type" binding:"required"`
	CardNetwork string  `json:"card_network" binding:"required"`
	Last4       *string `json:"last4"`
	Expiry      *string `json:"expiry"`
	Color       string  `json:"color"`
}

// GET /api/cards
func (h *CardAliasHandler) List(c *gin.Context) {
	userID := c.GetString("userID")

	var cards []models.CardAlias
	if err := h.db.Where("user_id = ?", userID).Order("created_at desc").Find(&cards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch card aliases"})
		return
	}

	c.JSON(http.StatusOK, cards)
}

// POST /api/cards
func (h *CardAliasHandler) Create(c *gin.Context) {
	userID := c.GetString("userID")

	var req cardAliasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	card := models.CardAlias{
		UserID:      userID,
		CardName:    req.CardName,
		CardType:    req.CardType,
		CardNetwork: req.CardNetwork,
		Last4:       req.Last4,
		Expiry:      req.Expiry,
		Color:       req.Color,
	}

	if err := h.db.Create(&card).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create card alias"})
		return
	}

	c.JSON(http.StatusCreated, card)
}

// PUT /api/cards/:id
func (h *CardAliasHandler) Update(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	var card models.CardAlias
	if err := h.db.Where("id = ? AND user_id = ?", id, userID).First(&card).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "card alias not found"})
		return
	}

	var req cardAliasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	card.CardName = req.CardName
	card.CardType = req.CardType
	card.CardNetwork = req.CardNetwork
	card.Last4 = req.Last4
	card.Expiry = req.Expiry
	card.Color = req.Color

	if err := h.db.Save(&card).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update card alias"})
		return
	}

	c.JSON(http.StatusOK, card)
}

// DELETE /api/cards/:id
func (h *CardAliasHandler) Delete(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")

	result := h.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.CardAlias{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete card alias"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "card alias not found"})
		return
	}

	c.Status(http.StatusNoContent)
}
