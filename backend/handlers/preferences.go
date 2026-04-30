package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/thinhtn3/bud/models"
	"gorm.io/gorm"
)

type PreferencesHandler struct {
	db *gorm.DB
}

func NewPreferencesHandler(db *gorm.DB) *PreferencesHandler {
	return &PreferencesHandler{db: db}
}

type savePreferencesRequest struct {
	FinancialGoals     []string `json:"financial_goals" binding:"required"`
	BudgetPeriod       string   `json:"budget_period" binding:"required"`
	BudgetAmount       float64  `json:"budget_amount" binding:"required"`
	CarryOverExcess    bool     `json:"carry_over_excess"`
	MonthlyIncome      *float64 `json:"monthly_income"`
	Currency           string   `json:"currency" binding:"required"`
	DefaultCardAliasID *string  `json:"default_card_alias_id"`
}

// PUT /api/me/preferences
// Persists onboarding / budget preferences and marks onboarding complete.
func (h *PreferencesHandler) SavePreferences(c *gin.Context) {
	userID := c.GetString("userID")

	var req savePreferencesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	goalsJSON, err := json.Marshal(req.FinancialGoals)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid financial_goals"})
		return
	}

	result := h.db.Model(&models.Profile{}).Where("id = ?", userID).Updates(map[string]any{
		"onboarding_completed":   true,
		"budget_period":          req.BudgetPeriod,
		"budget_amount":          req.BudgetAmount,
		"carry_over_excess":      req.CarryOverExcess,
		"monthly_income":         req.MonthlyIncome,
		"currency":               req.Currency,
		"financial_goals":        string(goalsJSON),
		"default_card_alias_id":  req.DefaultCardAliasID,
	})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save preferences"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "profile not found"})
		return
	}

	var profile models.Profile
	if err := h.db.First(&profile, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load profile"})
		return
	}

	goals := []string{}
	_ = json.Unmarshal([]byte(profile.FinancialGoals), &goals)

	c.JSON(http.StatusOK, preferencesResponse{
		OnboardingCompleted: profile.OnboardingCompleted,
		BudgetPeriod:        profile.BudgetPeriod,
		BudgetAmount:        profile.BudgetAmount,
		CarryOverExcess:     profile.CarryOverExcess,
		MonthlyIncome:       profile.MonthlyIncome,
		Currency:            profile.Currency,
		FinancialGoals:      goals,
		DefaultCardAliasID:  profile.DefaultCardAliasID,
	})
}
