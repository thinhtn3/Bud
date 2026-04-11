package handlers

import (
	"math"
	"math/rand"
	"net/http"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/thinhtn3/bud/models"
	"gorm.io/gorm"
)

type GroupHandler struct {
	db *gorm.DB
}

func NewGroupHandler(db *gorm.DB) *GroupHandler {
	return &GroupHandler{db: db}
}

// ── Request / Response types ──────────────────────────────────────────────────

type createGroupRequest struct {
	Name string `json:"name" binding:"required"`
}

type updateGroupRequest struct {
	Name string `json:"name" binding:"required"`
}

type joinGroupRequest struct {
	InviteCode string `json:"invite_code" binding:"required"`
}

type splitInput struct {
	UserID string  `json:"user_id" binding:"required"`
	Amount float64 `json:"amount" binding:"required,gte=0"`
}

type createExpenseRequest struct {
	Name        string       `json:"name" binding:"required"`
	Amount      float64      `json:"amount" binding:"required,gt=0"`
	Date        string       `json:"date" binding:"required"`
	PaidBy      string       `json:"paid_by" binding:"required"`
	CategoryID  *string      `json:"category_id"`
	Description *string      `json:"description"`
	Splits      []splitInput `json:"splits" binding:"required,min=1"`
}

type groupListItem struct {
	models.Group
	MemberCount    int      `json:"member_count"`
	MembersPreview []string `json:"members_preview" gorm:"-"`
}

type memberDetail struct {
	UserID      string    `json:"user_id"`
	DisplayName string    `json:"display_name"`
	JoinedAt    time.Time `json:"joined_at"`
}

type groupDetail struct {
	models.Group
	Members []memberDetail `json:"members"`
}

type splitDetail struct {
	UserID      string  `json:"user_id"`
	DisplayName string  `json:"display_name"`
	Amount      float64 `json:"amount"`
}

type expenseDetail struct {
	models.GroupExpense
	PaidByName   string        `json:"paid_by_name"`
	CategoryName *string       `json:"category_name"`
	Splits       []splitDetail `json:"splits"`
}

type memberBalance struct {
	UserID      string  `json:"user_id"`
	DisplayName string  `json:"display_name"`
	Balance     float64 `json:"balance"` // positive = owed money, negative = owes money
}

type settlement struct {
	FromUserID      string  `json:"from_user_id"`
	FromDisplayName string  `json:"from_display_name"`
	ToUserID        string  `json:"to_user_id"`
	ToDisplayName   string  `json:"to_display_name"`
	Amount          float64 `json:"amount"`
}

type settlementRecord struct {
	ID              string    `json:"id"`
	FromUserID      string    `json:"from_user_id"`
	FromDisplayName string    `json:"from_display_name"`
	ToUserID        string    `json:"to_user_id"`
	ToDisplayName   string    `json:"to_display_name"`
	Amount          float64   `json:"amount"`
	Date            time.Time `json:"date"`
}

type balancesResponse struct {
	NetBalances []memberBalance   `json:"net_balances"`
	Settlements []settlement      `json:"settlements"` // suggested remaining
	History     []settlementRecord `json:"history"`    // past settlements
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"

func generateInviteCode() string {
	b := make([]byte, 8)
	for i := range b {
		b[i] = codeAlphabet[rand.Intn(len(codeAlphabet))]
	}
	return string(b)
}

// isMember returns true if userID belongs to groupID.
func (h *GroupHandler) isMember(groupID, userID string) bool {
	var count int64
	h.db.Model(&models.GroupMember{}).
		Where("group_id = ? AND user_id = ?", groupID, userID).
		Count(&count)
	return count > 0
}

// requireMember writes a 403 and returns false if the caller is not a member.
func (h *GroupHandler) requireMember(c *gin.Context, groupID, userID string) bool {
	if !h.isMember(groupID, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not a member of this group"})
		return false
	}
	return true
}

// computeSettlementsFromNet runs the greedy algorithm directly on a pre-built net map.
func computeSettlementsFromNet(net map[string]float64, nameMap map[string]string) []settlement {
	type entry struct {
		userID string
		amount float64
	}
	const eps = 0.005
	var creditors, debtors []entry
	for uid, bal := range net {
		if bal > eps {
			creditors = append(creditors, entry{uid, bal})
		} else if bal < -eps {
			debtors = append(debtors, entry{uid, -bal})
		}
	}
	var result []settlement
	for len(creditors) > 0 && len(debtors) > 0 {
		sort.Slice(creditors, func(i, j int) bool { return creditors[i].amount > creditors[j].amount })
		sort.Slice(debtors, func(i, j int) bool { return debtors[i].amount > debtors[j].amount })
		cr, db := creditors[0], debtors[0]
		transfer := math.Round(math.Min(cr.amount, db.amount)*100) / 100
		result = append(result, settlement{
			FromUserID:      db.userID,
			FromDisplayName: nameMap[db.userID],
			ToUserID:        cr.userID,
			ToDisplayName:   nameMap[cr.userID],
			Amount:          transfer,
		})
		cr.amount -= transfer
		db.amount -= transfer
		if cr.amount > eps {
			creditors[0] = cr
		} else {
			creditors = creditors[1:]
		}
		if db.amount > eps {
			debtors[0] = db
		} else {
			debtors = debtors[1:]
		}
	}
	return result
}

// computeSettlements runs the greedy debt-simplification algorithm.
func computeSettlements(
	expenses []models.GroupExpense,
	splits []models.GroupExpenseSplit,
	nameMap map[string]string,
) []settlement {
	net := map[string]float64{}

	for _, e := range expenses {
		net[e.PaidBy] += e.Amount
	}
	for _, s := range splits {
		net[s.UserID] -= s.Amount
	}

	type entry struct {
		userID string
		amount float64 // always stored as positive magnitude
	}

	const eps = 0.005

	var creditors, debtors []entry
	for uid, bal := range net {
		if bal > eps {
			creditors = append(creditors, entry{uid, bal})
		} else if bal < -eps {
			debtors = append(debtors, entry{uid, -bal})
		}
	}

	var result []settlement
	for len(creditors) > 0 && len(debtors) > 0 {
		sort.Slice(creditors, func(i, j int) bool { return creditors[i].amount > creditors[j].amount })
		sort.Slice(debtors, func(i, j int) bool { return debtors[i].amount > debtors[j].amount })

		cr := creditors[0]
		db := debtors[0]
		transfer := math.Min(cr.amount, db.amount)
		transfer = math.Round(transfer*100) / 100

		result = append(result, settlement{
			FromUserID:      db.userID,
			FromDisplayName: nameMap[db.userID],
			ToUserID:        cr.userID,
			ToDisplayName:   nameMap[cr.userID],
			Amount:          transfer,
		})

		cr.amount -= transfer
		db.amount -= transfer

		if cr.amount > eps {
			creditors[0] = cr
		} else {
			creditors = creditors[1:]
		}
		if db.amount > eps {
			debtors[0] = db
		} else {
			debtors = debtors[1:]
		}
	}

	return result
}

// ── Handlers ──────────────────────────────────────────────────────────────────

// GET /api/groups
func (h *GroupHandler) ListGroups(c *gin.Context) {
	userID := c.GetString("userID")

	var items []groupListItem
	err := h.db.Raw(`
		SELECT g.*, COUNT(gm2.id) AS member_count
		FROM groups g
		JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?
		JOIN group_members gm2 ON gm2.group_id = g.id
		GROUP BY g.id
		ORDER BY g.created_at DESC
	`, userID).Scan(&items).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch groups"})
		return
	}
	if items == nil {
		items = []groupListItem{}
	}

	// Fetch up to 4 member display names per group (single query, not N+1).
	if len(items) > 0 {
		groupIDs := make([]string, len(items))
		for i, it := range items {
			groupIDs[i] = it.ID
		}
		type memberRow struct {
			GroupID     string `gorm:"column:group_id"`
			DisplayName string `gorm:"column:display_name"`
		}
		var rows []memberRow
		h.db.Raw(`
			SELECT gm.group_id, p.display_name
			FROM group_members gm
			JOIN profiles p ON p.id = gm.user_id
			WHERE gm.group_id IN ?
			ORDER BY gm.joined_at ASC
		`, groupIDs).Scan(&rows)

		// Build map: groupID → first 4 names
		preview := make(map[string][]string, len(items))
		for _, r := range rows {
			if len(preview[r.GroupID]) < 4 {
				preview[r.GroupID] = append(preview[r.GroupID], r.DisplayName)
			}
		}
		for i := range items {
			if names, ok := preview[items[i].ID]; ok {
				items[i].MembersPreview = names
			} else {
				items[i].MembersPreview = []string{}
			}
		}
	}

	c.JSON(http.StatusOK, items)
}

// POST /api/groups
func (h *GroupHandler) CreateGroup(c *gin.Context) {
	userID := c.GetString("userID")

	var req createGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var group models.Group
	var err error
	for attempt := 0; attempt < 3; attempt++ {
		err = h.db.Transaction(func(tx *gorm.DB) error {
			group = models.Group{
				Name:       req.Name,
				CreatedBy:  userID,
				InviteCode: generateInviteCode(),
			}
			if err := tx.Create(&group).Error; err != nil {
				return err
			}
			member := models.GroupMember{GroupID: group.ID, UserID: userID}
			return tx.Create(&member).Error
		})
		if err == nil {
			break
		}
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create group"})
		return
	}

	c.JSON(http.StatusCreated, group)
}

// POST /api/groups/join
func (h *GroupHandler) JoinGroup(c *gin.Context) {
	userID := c.GetString("userID")

	var req joinGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var group models.Group
	if err := h.db.Where("LOWER(invite_code) = LOWER(?)", req.InviteCode).First(&group).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invalid invite code"})
		return
	}

	member := models.GroupMember{GroupID: group.ID, UserID: userID}
	result := h.db.Where(models.GroupMember{GroupID: group.ID, UserID: userID}).FirstOrCreate(&member)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not join group"})
		return
	}

	c.JSON(http.StatusOK, group)
}

// GET /api/groups/:id
func (h *GroupHandler) GetGroup(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	if !h.requireMember(c, groupID, userID) {
		return
	}

	var group models.Group
	if err := h.db.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
		return
	}

	type memberRow struct {
		UserID      string    `gorm:"column:user_id"`
		DisplayName string    `gorm:"column:display_name"`
		JoinedAt    time.Time `gorm:"column:joined_at"`
	}
	var rows []memberRow
	h.db.Raw(`
		SELECT gm.user_id, p.display_name, gm.joined_at
		FROM group_members gm
		JOIN profiles p ON p.id = gm.user_id
		WHERE gm.group_id = ?
		ORDER BY gm.joined_at ASC
	`, groupID).Scan(&rows)

	members := make([]memberDetail, len(rows))
	for i, r := range rows {
		members[i] = memberDetail{UserID: r.UserID, DisplayName: r.DisplayName, JoinedAt: r.JoinedAt}
	}

	c.JSON(http.StatusOK, groupDetail{Group: group, Members: members})
}

// PATCH /api/groups/:id
func (h *GroupHandler) UpdateGroup(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	if !h.requireMember(c, groupID, userID) {
		return
	}

	var group models.Group
	if err := h.db.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
		return
	}
	if group.CreatedBy != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the group creator can rename this group"})
		return
	}

	var req updateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}

	if err := h.db.Model(&group).Update("name", req.Name).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update group"})
		return
	}

	// Return updated group detail (same shape as GetGroup)
	type memberRow struct {
		UserID      string    `gorm:"column:user_id"`
		DisplayName string    `gorm:"column:display_name"`
		JoinedAt    time.Time `gorm:"column:joined_at"`
	}
	var rows []memberRow
	h.db.Raw(`
		SELECT gm.user_id, p.display_name, gm.joined_at
		FROM group_members gm
		JOIN profiles p ON p.id = gm.user_id
		WHERE gm.group_id = ?
		ORDER BY gm.joined_at ASC
	`, groupID).Scan(&rows)
	members := make([]memberDetail, len(rows))
	for i, r := range rows {
		members[i] = memberDetail{UserID: r.UserID, DisplayName: r.DisplayName, JoinedAt: r.JoinedAt}
	}
	c.JSON(http.StatusOK, groupDetail{Group: group, Members: members})
}

// DELETE /api/groups/:id
func (h *GroupHandler) DeleteGroup(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	if !h.requireMember(c, groupID, userID) {
		return
	}

	var group models.Group
	if err := h.db.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
		return
	}
	if group.CreatedBy != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the group creator can delete this group"})
		return
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		// Delete splits for all expenses in this group
		if err := tx.Exec(`
			DELETE FROM group_expense_splits
			WHERE expense_id IN (SELECT id FROM group_expenses WHERE group_id = ?)
		`, groupID).Error; err != nil {
			return err
		}
		if err := tx.Where("group_id = ?", groupID).Delete(&models.GroupExpense{}).Error; err != nil {
			return err
		}
		if err := tx.Where("group_id = ?", groupID).Delete(&models.GroupSettlement{}).Error; err != nil {
			return err
		}
		if err := tx.Where("group_id = ?", groupID).Delete(&models.GroupMember{}).Error; err != nil {
			return err
		}
		return tx.Delete(&models.Group{}, "id = ?", groupID).Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete group"})
		return
	}

	c.Status(http.StatusNoContent)
}

// DELETE /api/groups/:id/members/me
func (h *GroupHandler) LeaveGroup(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	if !h.requireMember(c, groupID, userID) {
		return
	}

	var group models.Group
	if err := h.db.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
		return
	}
	if group.CreatedBy == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "the group owner cannot leave; delete the group instead"})
		return
	}

	if err := h.db.Where("group_id = ? AND user_id = ?", groupID, userID).Delete(&models.GroupMember{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not leave group"})
		return
	}

	c.Status(http.StatusNoContent)
}

// DELETE /api/groups/:id/members/:userId
func (h *GroupHandler) RemoveMember(c *gin.Context) {
	callerID := c.GetString("userID")
	groupID := c.Param("id")
	targetUserID := c.Param("userId")

	if !h.requireMember(c, groupID, callerID) {
		return
	}

	var group models.Group
	if err := h.db.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "group not found"})
		return
	}
	if group.CreatedBy != callerID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the group owner can remove members"})
		return
	}
	if targetUserID == callerID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot remove yourself"})
		return
	}

	if err := h.db.Where("group_id = ? AND user_id = ?", groupID, targetUserID).Delete(&models.GroupMember{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not remove member"})
		return
	}

	c.Status(http.StatusNoContent)
}

// POST /api/groups/:id/expenses
func (h *GroupHandler) CreateExpense(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	if !h.requireMember(c, groupID, userID) {
		return
	}

	var req createExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate paid_by is a member
	if !h.isMember(groupID, req.PaidBy) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "paid_by user is not a member of this group"})
		return
	}

	// Collect all member IDs for validation
	var memberIDs []string
	h.db.Model(&models.GroupMember{}).Where("group_id = ?", groupID).Pluck("user_id", &memberIDs)
	memberSet := map[string]bool{}
	for _, id := range memberIDs {
		memberSet[id] = true
	}

	// Validate splits
	var splitTotal float64
	for _, s := range req.Splits {
		if !memberSet[s.UserID] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "split user " + s.UserID + " is not a member of this group"})
			return
		}
		splitTotal += s.Amount
	}
	if math.Abs(splitTotal-req.Amount) > 0.01 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "splits must sum to the expense amount"})
		return
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, use YYYY-MM-DD"})
		return
	}

	var expense models.GroupExpense
	txErr := h.db.Transaction(func(tx *gorm.DB) error {
		expense = models.GroupExpense{
			GroupID:     groupID,
			PaidBy:      req.PaidBy,
			CategoryID:  req.CategoryID,
			Name:        req.Name,
			Amount:      req.Amount,
			Date:        date,
			Description: req.Description,
		}
		if err := tx.Create(&expense).Error; err != nil {
			return err
		}
		for _, s := range req.Splits {
			split := models.GroupExpenseSplit{
				ExpenseID: expense.ID,
				UserID:    s.UserID,
				Amount:    s.Amount,
			}
			if err := tx.Create(&split).Error; err != nil {
				return err
			}
		}
		// Auto-create a personal transaction for the payer only.
		// Shows the full fronted amount on their dashboard; group_my_share
		// records their actual cost for supplementary display.
		var payerShare float64
		for _, s := range req.Splits {
			if s.UserID == req.PaidBy {
				payerShare = s.Amount
				break
			}
		}
		payerTx := models.Transaction{
			UserID:         req.PaidBy,
			Type:           models.TransactionTypeExpense,
			Name:           req.Name,
			Amount:         req.Amount,
			Date:           date,
			CategoryID:     req.CategoryID,
			Description:    req.Description,
			GroupExpenseID: &expense.ID,
			GroupMyShare:   &payerShare,
		}
		return tx.Create(&payerTx).Error
	})
	if txErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create expense"})
		return
	}

	c.JSON(http.StatusCreated, expense)
}

// GET /api/groups/:id/expenses
func (h *GroupHandler) ListExpenses(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	if !h.requireMember(c, groupID, userID) {
		return
	}

	var expenses []models.GroupExpense
	if err := h.db.Where("group_id = ?", groupID).Order("date DESC, created_at DESC").Find(&expenses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch expenses"})
		return
	}

	if len(expenses) == 0 {
		c.JSON(http.StatusOK, []expenseDetail{})
		return
	}

	expenseIDs := make([]string, len(expenses))
	for i, e := range expenses {
		expenseIDs[i] = e.ID
	}

	var splits []models.GroupExpenseSplit
	h.db.Where("expense_id IN ?", expenseIDs).Find(&splits)

	// Build display name map for all relevant users
	allUserIDs := map[string]bool{}
	for _, e := range expenses {
		allUserIDs[e.PaidBy] = true
	}
	for _, s := range splits {
		allUserIDs[s.UserID] = true
	}
	nameMap := h.buildNameMap(allUserIDs)

	// Build category name map for any categories referenced by these expenses
	catIDs := []string{}
	for _, e := range expenses {
		if e.CategoryID != nil {
			catIDs = append(catIDs, *e.CategoryID)
		}
	}
	catNameMap := map[string]string{}
	if len(catIDs) > 0 {
		type catRow struct {
			ID   string `gorm:"column:id"`
			Name string `gorm:"column:name"`
		}
		var cats []catRow
		h.db.Raw("SELECT id, name FROM categories WHERE id IN ?", catIDs).Scan(&cats)
		for _, c := range cats {
			catNameMap[c.ID] = c.Name
		}
	}

	// Group splits by expense ID
	splitsByExpense := map[string][]models.GroupExpenseSplit{}
	for _, s := range splits {
		splitsByExpense[s.ExpenseID] = append(splitsByExpense[s.ExpenseID], s)
	}

	result := make([]expenseDetail, len(expenses))
	for i, e := range expenses {
		details := make([]splitDetail, 0)
		for _, s := range splitsByExpense[e.ID] {
			details = append(details, splitDetail{
				UserID:      s.UserID,
				DisplayName: nameMap[s.UserID],
				Amount:      s.Amount,
			})
		}
		var catName *string
		if e.CategoryID != nil {
			if n, ok := catNameMap[*e.CategoryID]; ok {
				catName = &n
			}
		}
		result[i] = expenseDetail{
			GroupExpense: e,
			PaidByName:   nameMap[e.PaidBy],
			CategoryName: catName,
			Splits:       details,
		}
	}

	c.JSON(http.StatusOK, result)
}

// DELETE /api/groups/:id/expenses/:expenseId
func (h *GroupHandler) DeleteExpense(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")
	expenseID := c.Param("expenseId")

	if !h.requireMember(c, groupID, userID) {
		return
	}

	var expense models.GroupExpense
	if err := h.db.Where("id = ? AND group_id = ?", expenseID, groupID).First(&expense).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "expense not found"})
		return
	}

	// Only paid_by or group creator may delete
	var group models.Group
	h.db.First(&group, "id = ?", groupID)
	if expense.PaidBy != userID && group.CreatedBy != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the payer or group creator can delete this expense"})
		return
	}

	if err := h.db.Delete(&models.GroupExpense{}, "id = ?", expenseID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete expense"})
		return
	}

	c.Status(http.StatusNoContent)
}

// POST /api/groups/:id/settlements
func (h *GroupHandler) CreateSettlement(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	if !h.requireMember(c, groupID, userID) {
		return
	}

	var req struct {
		ToUserID string  `json:"to_user_id" binding:"required"`
		Amount   float64 `json:"amount" binding:"required,gt=0"`
		Date     string  `json:"date"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if userID == req.ToUserID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot settle with yourself"})
		return
	}
	if !h.isMember(groupID, req.ToUserID) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "to_user_id is not a member of this group"})
		return
	}

	date := time.Now()
	if req.Date != "" {
		if d, err := time.Parse("2006-01-02", req.Date); err == nil {
			date = d
		}
	}

	var group models.Group
	h.db.First(&group, "id = ?", groupID)
	settlementName := "Settlement · " + group.Name
	nameMap := h.buildNameMap(map[string]bool{userID: true, req.ToUserID: true})

	var s models.GroupSettlement
	txErr := h.db.Transaction(func(tx *gorm.DB) error {
		s = models.GroupSettlement{
			GroupID:    groupID,
			FromUserID: userID,
			ToUserID:   req.ToUserID,
			Amount:     req.Amount,
			Date:       date,
		}
		if err := tx.Create(&s).Error; err != nil {
			return err
		}
		// Payer (from_user) loses money — show as expense on their dashboard
		fromTx := models.Transaction{
			UserID:            userID,
			Type:              models.TransactionTypeExpense,
			Name:              settlementName,
			Amount:            req.Amount,
			Date:              date,
			GroupSettlementID: &s.ID,
		}
		if err := tx.Create(&fromTx).Error; err != nil {
			return err
		}
		// Recipient (to_user) gains money — show as reimbursement on their dashboard
		toTx := models.Transaction{
			UserID:            req.ToUserID,
			Type:              models.TransactionTypeReimbursement,
			Name:              settlementName,
			Amount:            req.Amount,
			Date:              date,
			GroupSettlementID: &s.ID,
		}
		return tx.Create(&toTx).Error
	})
	if txErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not record settlement"})
		return
	}

	c.JSON(http.StatusCreated, settlementRecord{
		ID:              s.ID,
		FromUserID:      s.FromUserID,
		FromDisplayName: nameMap[s.FromUserID],
		ToUserID:        s.ToUserID,
		ToDisplayName:   nameMap[s.ToUserID],
		Amount:          s.Amount,
		Date:            s.Date,
	})
}

// DELETE /api/groups/:id/settlements/:settlementId
func (h *GroupHandler) DeleteSettlement(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")
	settlementID := c.Param("settlementId")

	if !h.requireMember(c, groupID, userID) {
		return
	}

	var settlement models.GroupSettlement
	if err := h.db.First(&settlement, "id = ? AND group_id = ?", settlementID, groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "settlement not found"})
		return
	}

	var group models.Group
	h.db.First(&group, "id = ?", groupID)

	if settlement.FromUserID != userID && group.CreatedBy != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only the payer or group creator can delete a settlement"})
		return
	}

	deleteTransactions := c.Query("delete_transactions") == "true"

	txErr := h.db.Transaction(func(tx *gorm.DB) error {
		if deleteTransactions {
			if err := tx.Exec("DELETE FROM transactions WHERE group_settlement_id = ?", settlementID).Error; err != nil {
				return err
			}
		}
		return tx.Delete(&settlement).Error
	})
	if txErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete settlement"})
		return
	}

	c.Status(http.StatusNoContent)
}

// GET /api/groups/:id/balances
func (h *GroupHandler) GetBalances(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	if !h.requireMember(c, groupID, userID) {
		return
	}

	var expenses []models.GroupExpense
	h.db.Where("group_id = ?", groupID).Find(&expenses)

	var splits []models.GroupExpenseSplit
	if len(expenses) > 0 {
		expenseIDs := make([]string, len(expenses))
		for i, e := range expenses {
			expenseIDs[i] = e.ID
		}
		h.db.Where("expense_id IN ?", expenseIDs).Find(&splits)
	}

	var pastSettlements []models.GroupSettlement
	h.db.Where("group_id = ?", groupID).Order("date desc, created_at desc").Find(&pastSettlements)

	// Build name map for all members
	var memberIDs []string
	h.db.Model(&models.GroupMember{}).Where("group_id = ?", groupID).Pluck("user_id", &memberIDs)
	memberIDSet := map[string]bool{}
	for _, id := range memberIDs {
		memberIDSet[id] = true
	}
	nameMap := h.buildNameMap(memberIDSet)

	// Compute net balances from expenses
	net := map[string]float64{}
	for _, id := range memberIDs {
		net[id] = 0
	}
	for _, e := range expenses {
		net[e.PaidBy] += e.Amount
	}
	for _, s := range splits {
		net[s.UserID] -= s.Amount
	}
	// Factor in past settlements
	for _, s := range pastSettlements {
		net[s.FromUserID] += s.Amount // debtor paid → their debt reduces
		net[s.ToUserID] -= s.Amount   // creditor received → their credit reduces
	}

	netBalances := make([]memberBalance, 0, len(memberIDs))
	for _, id := range memberIDs {
		bal := math.Round(net[id]*100) / 100
		netBalances = append(netBalances, memberBalance{
			UserID:      id,
			DisplayName: nameMap[id],
			Balance:     bal,
		})
	}
	sort.Slice(netBalances, func(i, j int) bool {
		return netBalances[i].Balance > netBalances[j].Balance
	})

	suggested := computeSettlements(expenses, splits, nameMap)
	// Re-run simplification on the settlement-adjusted net balances
	suggested = computeSettlementsFromNet(net, nameMap)
	if suggested == nil {
		suggested = []settlement{}
	}

	history := make([]settlementRecord, len(pastSettlements))
	for i, s := range pastSettlements {
		history[i] = settlementRecord{
			ID:              s.ID,
			FromUserID:      s.FromUserID,
			FromDisplayName: nameMap[s.FromUserID],
			ToUserID:        s.ToUserID,
			ToDisplayName:   nameMap[s.ToUserID],
			Amount:          s.Amount,
			Date:            s.Date,
		}
	}

	c.JSON(http.StatusOK, balancesResponse{
		NetBalances: netBalances,
		Settlements: suggested,
		History:     history,
	})
}

// buildNameMap fetches display_name for a set of user IDs.
func (h *GroupHandler) buildNameMap(userIDs interface{ /* map[string]bool or []string */ }) map[string]string {
	ids := toStringSlice(userIDs)
	if len(ids) == 0 {
		return map[string]string{}
	}
	type row struct {
		ID          string
		DisplayName string
	}
	var rows []row
	h.db.Raw("SELECT id, display_name FROM profiles WHERE id IN ?", ids).Scan(&rows)
	m := map[string]string{}
	for _, r := range rows {
		m[r.ID] = r.DisplayName
	}
	return m
}

func toStringSlice(v interface{}) []string {
	switch t := v.(type) {
	case map[string]bool:
		s := make([]string, 0, len(t))
		for k := range t {
			s = append(s, k)
		}
		return s
	case []string:
		return t
	}
	return nil
}
