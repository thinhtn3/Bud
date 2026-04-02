package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL       string
	SupabaseJWTSecret string
	SupabaseURL       string
	FrontendURL       string
	AppEnv            string
	Port              string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	return &Config{
		DatabaseURL:       mustGet("DATABASE_URL"),
		SupabaseJWTSecret: mustGet("SUPABASE_JWT_SECRET"),
		SupabaseURL:       mustGet("SUPABASE_URL"),
		FrontendURL:       getOr("FRONTEND_URL", "http://localhost:5173"),
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
