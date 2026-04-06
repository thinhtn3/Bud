package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/thinhtn3/bud/models"
	"gorm.io/gorm"
)

type CategoryHandler struct {
	db *gorm.DB
}

func NewCategoryHandler(db *gorm.DB) *CategoryHandler {
	return &CategoryHandler{db: db}
}

type createCategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

// POST /api/categories
func (h *CategoryHandler) Create(c *gin.Context) {
	userID := c.GetString("userID")

	var req createCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cat := models.Category{
		UserID: &userID,
		Name:   req.Name,
	}

	if err := h.db.Create(&cat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create category"})
		return
	}

	c.JSON(http.StatusCreated, cat)
}
