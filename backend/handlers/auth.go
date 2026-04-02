package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/thinhtn3/bud/supabase"
)

type AuthHandler struct {
	supabase *supabase.Client
	isProd   bool
}

func NewAuthHandler(sb *supabase.Client, isProd bool) *AuthHandler {
	return &AuthHandler{supabase: sb, isProd: isProd}
}

type setSessionRequest struct {
	AccessToken  string `json:"access_token" binding:"required"`
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// POST /api/auth/session
// Called by the frontend after a successful Supabase login.
// Validates the access token and sets HTTP-only cookies.
func (h *AuthHandler) SetSession(c *gin.Context) {
	var req setSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "access_token and refresh_token are required"})
		return
	}

	h.setAccessTokenCookie(c, req.AccessToken)
	h.setRefreshTokenCookie(c, req.RefreshToken)

	c.JSON(http.StatusOK, gin.H{"message": "session created"})
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
