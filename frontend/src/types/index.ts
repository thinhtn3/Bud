export interface GroupReimbursement {
  user_id: string
  display_name: string
  amount: number
}

export interface Transaction {
  id: string
  type: 'expense' | 'income' | 'reimbursement'
  name: string
  description: string | null
  amount: number
  date: string
  category_id: string | null
  card_alias_id: string | null
  group_expense_id: string | null
  group_my_share: number | null
  group_reimbursements?: GroupReimbursement[]
}

export interface Group {
  id: string
  name: string
  created_by: string
  invite_code: string
  created_at: string
  member_count?: number
  members_preview?: string[]
}

export interface GroupMember {
  user_id: string
  display_name: string
  joined_at: string
}

export interface GroupDetail extends Group {
  members: GroupMember[]
}

export interface GroupExpenseSplit {
  user_id: string
  display_name: string
  amount: number
}

export interface GroupExpense {
  id: string
  group_id: string
  paid_by: string
  paid_by_name: string
  category_id: string | null
  name: string
  amount: number
  date: string
  description: string | null
  created_at: string
  splits: GroupExpenseSplit[]
}

export interface MemberBalance {
  user_id: string
  display_name: string
  balance: number
}

export interface Settlement {
  from_user_id: string
  from_display_name: string
  to_user_id: string
  to_display_name: string
  amount: number
}

export interface SettlementRecord {
  id: string
  from_user_id: string
  from_display_name: string
  to_user_id: string
  to_display_name: string
  amount: number
  date: string
}

export interface GroupBalances {
  net_balances: MemberBalance[]
  settlements: Settlement[]
  history: SettlementRecord[]
}

export interface CardAlias {
  id: string
  user_id: string
  card_name: string
  card_type: string
  card_network: string
  last4: string | null
  expiry: string | null
  color: string
  created_at: string
  updated_at: string
}
