package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/thinhtn3/bud/models"
	"gorm.io/gorm"
)

type WidgetHandler struct {
	db *gorm.DB
}

func NewWidgetHandler(db *gorm.DB) *WidgetHandler {
	return &WidgetHandler{db: db}
}

// GET /api/dashboard/widgets
func (h *WidgetHandler) List(c *gin.Context) {
	userID := c.GetString("userID")

	widgets := make([]models.Widget, 0)
	if err := h.db.Where("user_id = ?", userID).
		Order("position asc").
		Find(&widgets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch widgets"})
		return
	}

	c.JSON(http.StatusOK, widgets)
}

type saveWidgetEntry struct {
	Type     string `json:"type" binding:"required"`
	Size     string `json:"size" binding:"required"`
	Position int    `json:"position"`
}

// PUT /api/dashboard/widgets
// Replaces the entire widget layout for the authenticated user.
func (h *WidgetHandler) Save(c *gin.Context) {
	userID := c.GetString("userID")

	var entries []saveWidgetEntry
	if err := c.ShouldBindJSON(&entries); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var widgets []models.Widget
	err := h.db.Transaction(func(tx *gorm.DB) error {
		// Delete all existing widgets for this user
		if err := tx.Where("user_id = ?", userID).Delete(&models.Widget{}).Error; err != nil {
			return err
		}

		// Insert new set
		for _, e := range entries {
			w := models.Widget{
				UserID:   userID,
				Type:     e.Type,
				Size:     e.Size,
				Position: e.Position,
			}
			if err := tx.Create(&w).Error; err != nil {
				return err
			}
		}

		// Read back inside the transaction for a consistent result
		return tx.Where("user_id = ?", userID).Order("position asc").Find(&widgets).Error
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save widgets"})
		return
	}

	c.JSON(http.StatusOK, widgets)
}
