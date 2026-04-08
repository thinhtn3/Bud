package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL       string
	SupabaseJWTSecret string
	SupabaseURL       string
	AllowedOrigins    []string
	AppEnv            string
	Port              string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	rawOrigins := getOr("FRONTEND_URL", "http://localhost:5173")
	origins := []string{}
	for _, o := range strings.Split(rawOrigins, ",") {
		if trimmed := strings.TrimSpace(o); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}

	return &Config{
		DatabaseURL:       mustGet("DATABASE_URL"),
		SupabaseJWTSecret: mustGet("SUPABASE_JWT_SECRET"),
		SupabaseURL:       mustGet("SUPABASE_URL"),
		AllowedOrigins:    origins,
		AppEnv:            getOr("APP_ENV", "development"),
		Port:              getOr("PORT", "8080"),
	}
}

func mustGet(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("required env var %s is not set", key)
	}
	return v
}

func getOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
