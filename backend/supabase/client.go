package supabase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type Client struct {
	baseURL string
}

func New(supabaseURL string) *Client {
	return &Client{baseURL: supabaseURL}
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
}

// RefreshSession exchanges a refresh token for a new access + refresh token pair.
func (c *Client) RefreshSession(refreshToken string) (*TokenResponse, error) {
	body, _ := json.Marshal(refreshRequest{RefreshToken: refreshToken})

	url := fmt.Sprintf("%s/auth/v1/token?grant_type=refresh_token", c.baseURL)
	resp, err := http.Post(url, "application/json", bytes.NewReader(body)) //nolint:gosec
	if err != nil {
		return nil, fmt.Errorf("refresh request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("supabase returned %d", resp.StatusCode)
	}

	var tokens TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokens); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}
	return &tokens, nil
}
