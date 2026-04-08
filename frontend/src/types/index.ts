export interface Transaction {
  id: string
  type: 'expense' | 'income' | 'reimbursement'
  name: string
  description: string | null
  amount: number
  date: string
  category_id: string | null
  card_alias_id: string | null
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
