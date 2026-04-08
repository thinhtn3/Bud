package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/thinhtn3/bud/config"
	"github.com/thinhtn3/bud/db"
	"github.com/thinhtn3/bud/handlers"
	"github.com/thinhtn3/bud/middleware"
	"github.com/thinhtn3/bud/supabase"
)

func Register(r *gin.Engine, cfg *config.Config) {
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))

	sb := supabase.New(cfg.SupabaseURL)
	isProd := cfg.AppEnv == "production"

	authHandler := handlers.NewAuthHandler(sb, db.DB, isProd)
	transactionHandler := handlers.NewTransactionHandler(db.DB)
	widgetHandler := handlers.NewWidgetHandler(db.DB)
	preferencesHandler := handlers.NewPreferencesHandler(db.DB)
	categoryHandler := handlers.NewCategoryHandler(db.DB)
	cardAliasHandler := handlers.NewCardAliasHandler(db.DB)

	// Auth routes — no JWT middleware
	auth := r.Group("/api/auth")
	{
		auth.POST("/session", authHandler.SetSession)
		auth.POST("/session/refresh", authHandler.RefreshSession)
		auth.DELETE("/session", authHandler.ClearSession)
	}

	// Protected routes — JWT cookie required
	api := r.Group("/api", middleware.Auth(cfg.SupabaseURL))
	{
		api.GET("/me", authHandler.Me)
		api.PUT("/me/preferences", preferencesHandler.SavePreferences)

		api.GET("/dashboard/widgets", widgetHandler.List)
		api.PUT("/dashboard/widgets", widgetHandler.Save)

		api.POST("/categories", categoryHandler.Create)

		api.GET("/cards", cardAliasHandler.List)
		api.POST("/cards", cardAliasHandler.Create)
		api.PUT("/cards/:id", cardAliasHandler.Update)
		api.DELETE("/cards/:id", cardAliasHandler.Delete)

		api.GET("/transactions/quick-add", transactionHandler.QuickAdd)
		api.GET("/transactions", transactionHandler.List)
		api.POST("/transactions", transactionHandler.Create)
		api.PATCH("/transactions/:id", transactionHandler.Update)
		api.DELETE("/transactions/:id", transactionHandler.Delete)
	}
}
