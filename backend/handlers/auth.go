package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/thinhtn3/bud/models"
	"github.com/thinhtn3/bud/supabase"
	"gorm.io/gorm"
)

type AuthHandler struct {
	supabase *supabase.Client
	db       *gorm.DB
	isProd   bool
}

func NewAuthHandler(sb *supabase.Client, db *gorm.DB, isProd bool) *AuthHandler {
	return &AuthHandler{supabase: sb, db: db, isProd: isProd}
}

type setSessionRequest struct {
	AccessToken  string `json:"access_token" binding:"required"`
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// POST /api/auth/session
// Called by the frontend after a successful Supabase login.
// Validates the access token, creates the profile on first login, and sets HTTP-only cookies.
func (h *AuthHandler) SetSession(c *gin.Context) {
	var req setSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "access_token and refresh_token are required"})
		return
	}

	// Decode claims without signature verification — Supabase already authenticated
	// the user. Signature validation happens in middleware/auth.go on every protected request.
	parser := jwt.NewParser()
	token, _, err := parser.ParseUnverified(req.AccessToken, jwt.MapClaims{})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "malformed access token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
		return
	}

	userID, _ := claims["sub"].(string)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing user id in token"})
		return
	}

	// Extract display_name from user_metadata
	var displayName string
	if meta, ok := claims["user_metadata"].(map[string]any); ok {
		displayName, _ = meta["display_name"].(string)
	}

	// Upsert profile — only create if it doesn't exist yet
	var profile models.Profile
	result := h.db.Where(models.Profile{ID: userID}).First(&profile)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// First login — create the profile
		if displayName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "display_name missing — please re-register"})
			return
		}
		profile = models.Profile{ID: userID, DisplayName: displayName}
		if err := h.db.Create(&profile).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create profile"})
			return
		}
	} else if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load profile"})
		return
	}

	// Seed default categories if the user has none — covers new users and
	// existing users who registered before seeding was introduced.
	var categoryCount int64
	h.db.Model(&models.Category{}).Where("user_id = ?", userID).Count(&categoryCount)
	if categoryCount == 0 {
		categories := make([]models.Category, len(models.DefaultCategories))
		for i, name := range models.DefaultCategories {
			categories[i] = models.Category{UserID: userID, Name: name}
		}
		if err := h.db.Create(&categories).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not seed categories"})
			return
		}
	}

	h.setAccessTokenCookie(c, req.AccessToken)
	h.setRefreshTokenCookie(c, req.RefreshToken)

	email, _ := claims["email"].(string)
	userData, err := h.loadUserData(userID, email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load user data"})
		return
	}

	c.JSON(http.StatusOK, userData)
}

type meResponse struct {
	ID          string            `json:"id"`
	Email       string            `json:"email"`
	DisplayName string            `json:"display_name"`
	Categories  []models.Category `json:"categories"`
}

// loadUserData fetches the profile and categories for a given user.
// Used by both SetSession (on login) and Me (on app load).
// Widgets are fetched separately by the dashboard — GET /api/dashboard/widgets.
func (h *AuthHandler) loadUserData(userID, email string) (*meResponse, error) {
	var profile models.Profile
	if err := h.db.First(&profile, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	var categories []models.Category
	if err := h.db.Where("user_id = ?", userID).Order("created_at asc").Find(&categories).Error; err != nil {
		return nil, err
	}

	return &meResponse{
		ID:          userID,
		Email:       email,
		DisplayName: profile.DisplayName,
		Categories:  categories,
	}, nil
}

// GET /api/me
// Returns the current user's profile, categories, and widget layout.
// Called after succesful login AND subsequent app loads.
func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.GetString("userID")
	email, _ := c.Get("email")

	data, err := h.loadUserData(userID, email.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load user data"})
		return
	}

	c.JSON(http.StatusOK, data)
}

// POST /api/auth/session/refresh
// Reads the refresh_token cookie, exchanges it with Supabase, and sets new cookies.
func (h *AuthHandler) RefreshSession(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "no refresh token"})
		return
	}

	tokens, err := h.supabase.RefreshSession(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "session expired, please log in again"})
		return
	}

	h.setAccessTokenCookie(c, tokens.AccessToken)
	h.setRefreshTokenCookie(c, tokens.RefreshToken)

	c.JSON(http.StatusOK, gin.H{"message": "session refreshed"})
}

// DELETE /api/auth/session
// Clears both session cookies.
func (h *AuthHandler) ClearSession(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "", h.isProd, true)
	c.SetCookie("refresh_token", "", -1, "/", "", h.isProd, true)
	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}

func (h *AuthHandler) setAccessTokenCookie(c *gin.Context, token string) {
	// MaxAge: 3600s = 1 hour, matches Supabase JWT expiry
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("access_token", token, 3600, "/", "", h.isProd, true)
}

func (h *AuthHandler) setRefreshTokenCookie(c *gin.Context, token string) {
	// MaxAge: 604800s = 7 days
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("refresh_token", token, 604800, "/", "", h.isProd, true)
}
