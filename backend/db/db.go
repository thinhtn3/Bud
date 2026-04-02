package db

import (
	"log"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect(dsn string) {
	config, err := pgx.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("failed to parse database url: %v", err)
	}
	// Simple protocol avoids prepared statement conflicts with GORM migrations
	config.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	sqlDB := stdlib.OpenDB(*config)
	DB, err = gorm.Open(postgres.New(postgres.Config{Conn: sqlDB}), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	log.Println("database connected")
}
