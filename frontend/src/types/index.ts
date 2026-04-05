export interface Transaction {
  id: string
  type: 'expense' | 'income'
  name: string
  description: string | null
  amount: number
  date: string
  category_id: string | null
}
