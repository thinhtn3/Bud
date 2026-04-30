export type WidgetType = 'spending_summary' | 'recent_transactions' | 'add_transaction' | 'quick_add' | 'category_breakdown' | 'card_spending'
export type WidgetSize = 'small' | 'medium' | 'large'

export interface WidgetDefinition {
  type: WidgetType
  label: string
  description: string
  sizes: WidgetSize[]
  defaultSize: WidgetSize
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    type: 'spending_summary',
    label: 'Spending Summary',
    description: 'Spending, income, and reimbursements by period',
    sizes: ['small', 'medium', 'large'],
    defaultSize: 'medium',
  },
  {
    type: 'recent_transactions',
    label: 'Recent Transactions',
    description: 'A scrollable list of your latest transactions',
    sizes: ['small', 'medium', 'large'],
    defaultSize: 'medium',
  },
  {
    type: 'add_transaction',
    label: 'Add Transaction',
    description: 'Quick-entry form to log a new expense or income',
    sizes: ['small', 'medium'],
    defaultSize: 'medium',
  },
  {
    type: 'quick_add',
    label: 'Quick Add',
    description: 'One-tap shortcuts from recurring and recent transactions',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
  },
  {
    type: 'category_breakdown',
    label: 'Spending by Category',
    description: 'Bar chart of your expenses this month by category',
    sizes: ['small', 'medium', 'large'],
    defaultSize: 'medium',
  },
  {
    type: 'card_spending',
    label: 'Spending by Card',
    description: 'Breakdown of your expenses by card alias this month',
    sizes: ['small', 'medium', 'large'],
    defaultSize: 'medium',
  },
]

export interface WidgetInstance {
  id: string
  type: WidgetType
  size: WidgetSize
}
