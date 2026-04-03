package middleware

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type jwks struct {
	Keys []jwk `json:"keys"`
}

type jwk struct {
	Kty string `json:"kty"`
	Alg string `json:"alg"`
	X   string `json:"x"`
	Y   string `json:"y"`
}

func fetchECPublicKey(supabaseURL string) (*ecdsa.PublicKey, error) {
	resp, err := http.Get(supabaseURL + "/auth/v1/.well-known/jwks.json") //nolint:gosec
	if err != nil {
		return nil, fmt.Errorf("fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	var keys jwks
	if err := json.NewDecoder(resp.Body).Decode(&keys); err != nil {
		return nil, fmt.Errorf("decode JWKS: %w", err)
	}

	for _, k := range keys.Keys {
		if k.Kty == "EC" && k.Alg == "ES256" {
			xBytes, err := base64.RawURLEncoding.DecodeString(k.X)
			if err != nil {
				return nil, fmt.Errorf("decode x: %w", err)
			}
			yBytes, err := base64.RawURLEncoding.DecodeString(k.Y)
			if err != nil {
				return nil, fmt.Errorf("decode y: %w", err)
			}
			return &ecdsa.PublicKey{
				Curve: elliptic.P256(),
				X:     new(big.Int).SetBytes(xBytes),
				Y:     new(big.Int).SetBytes(yBytes),
			}, nil
		}
	}
	return nil, fmt.Errorf("no ES256 key found in JWKS")
}

func Auth(supabaseURL string) gin.HandlerFunc {
	pubKey, err := fetchECPublicKey(supabaseURL)
	if err != nil {
		log.Fatalf("auth middleware: could not load Supabase public key: %v", err)
	}

	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("access_token")
		if err != nil || strings.TrimSpace(tokenStr) == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing session"})
			return
		}

		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodECDSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return pubKey, nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing user id"})
			return
		}

		c.Set("userID", userID)
		c.Set("email", claims["email"])
		c.Next()
	}
}
