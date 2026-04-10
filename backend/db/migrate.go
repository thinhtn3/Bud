package db

import (
	"log"

	"github.com/thinhtn3/bud/models"
)

// Migrate runs AutoMigrate for all registered models.
// To add a new model: define it in models/, then append &models.YourModel{} below.
func Migrate() {
	err := DB.AutoMigrate(
		&models.Profile{},
		&models.Category{},
		&models.CardAlias{},
		&models.Transaction{},
		&models.Widget{},
		&models.Group{},
		&models.GroupMember{},
		&models.GroupExpense{},
		&models.GroupExpenseSplit{},
		&models.GroupSettlement{},
	)
	if err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("migration complete")

	seedDefaultCategories()
	addForeignKeys()
}

// seedDefaultCategories inserts system-level categories (user_id = NULL) once.
// Safe to run on every startup — skips any that already exist.
func seedDefaultCategories() {
	for _, name := range models.DefaultCategories {
		DB.Where(models.Category{Name: name, UserID: nil}).FirstOrCreate(&models.Category{Name: name, UserID: nil})
	}
	log.Println("default categories seeded")
}

// addFKIfNotExists adds a foreign key constraint only if it does not already exist.
// PostgreSQL does not support ADD CONSTRAINT IF NOT EXISTS, so we check pg_constraint first.
func addFKIfNotExists(constraintName, table, alterSQL string) {
	var count int64
	err := DB.Raw(`
		SELECT COUNT(1) FROM pg_constraint c
		JOIN pg_class t ON t.oid = c.conrelid
		WHERE c.conname = ? AND t.relname = ?
	`, constraintName, table).Scan(&count).Error
	if err != nil {
		log.Fatalf("FK existence check failed for %s: %v", constraintName, err)
	}
	if count > 0 {
		return
	}
	if err := DB.Exec(alterSQL).Error; err != nil {
		log.Fatalf("failed to add FK %s: %v", constraintName, err)
	}
	log.Printf("FK %s added", constraintName)
}

// addForeignKeys adds all DB-level FK constraints. Safe to run on every startup.
func addForeignKeys() {
	addFKIfNotExists("fk_transactions_user_id", "transactions",
		`ALTER TABLE transactions ADD CONSTRAINT fk_transactions_user_id
		 FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_categories_user_id", "categories",
		`ALTER TABLE categories ADD CONSTRAINT fk_categories_user_id
		 FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_card_aliases_user_id", "card_aliases",
		`ALTER TABLE card_aliases ADD CONSTRAINT fk_card_aliases_user_id
		 FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_widgets_user_id", "widgets",
		`ALTER TABLE widgets ADD CONSTRAINT fk_widgets_user_id
		 FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_transactions_category_id", "transactions",
		`ALTER TABLE transactions ADD CONSTRAINT fk_transactions_category_id
		 FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL`)
	addFKIfNotExists("fk_transactions_card_alias_id", "transactions",
		`ALTER TABLE transactions ADD CONSTRAINT fk_transactions_card_alias_id
		 FOREIGN KEY (card_alias_id) REFERENCES card_aliases(id) ON DELETE SET NULL`)
	addFKIfNotExists("fk_transactions_group_expense_id", "transactions",
		`ALTER TABLE transactions ADD CONSTRAINT fk_transactions_group_expense_id
		 FOREIGN KEY (group_expense_id) REFERENCES group_expenses(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_transactions_group_settlement_id", "transactions",
		`ALTER TABLE transactions ADD CONSTRAINT fk_transactions_group_settlement_id
		 FOREIGN KEY (group_settlement_id) REFERENCES group_settlements(id) ON DELETE SET NULL`)
	// Group FKs
	addFKIfNotExists("fk_groups_created_by", "groups",
		`ALTER TABLE groups ADD CONSTRAINT fk_groups_created_by
		 FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_group_members_group_id", "group_members",
		`ALTER TABLE group_members ADD CONSTRAINT fk_group_members_group_id
		 FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_group_members_user_id", "group_members",
		`ALTER TABLE group_members ADD CONSTRAINT fk_group_members_user_id
		 FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_group_expenses_group_id", "group_expenses",
		`ALTER TABLE group_expenses ADD CONSTRAINT fk_group_expenses_group_id
		 FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_group_expenses_paid_by", "group_expenses",
		`ALTER TABLE group_expenses ADD CONSTRAINT fk_group_expenses_paid_by
		 FOREIGN KEY (paid_by) REFERENCES profiles(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_group_expense_splits_expense_id", "group_expense_splits",
		`ALTER TABLE group_expense_splits ADD CONSTRAINT fk_group_expense_splits_expense_id
		 FOREIGN KEY (expense_id) REFERENCES group_expenses(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_group_expense_splits_user_id", "group_expense_splits",
		`ALTER TABLE group_expense_splits ADD CONSTRAINT fk_group_expense_splits_user_id
		 FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_group_settlements_group_id", "group_settlements",
		`ALTER TABLE group_settlements ADD CONSTRAINT fk_group_settlements_group_id
		 FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_group_settlements_from_user_id", "group_settlements",
		`ALTER TABLE group_settlements ADD CONSTRAINT fk_group_settlements_from_user_id
		 FOREIGN KEY (from_user_id) REFERENCES profiles(id) ON DELETE CASCADE`)
	addFKIfNotExists("fk_group_settlements_to_user_id", "group_settlements",
		`ALTER TABLE group_settlements ADD CONSTRAINT fk_group_settlements_to_user_id
		 FOREIGN KEY (to_user_id) REFERENCES profiles(id) ON DELETE CASCADE`)
	log.Println("foreign key constraints verified")
}
