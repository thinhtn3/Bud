export type WidgetType = 'spending_summary' | 'recent_transactions' | 'add_transaction' | 'quick_add'

export interface WidgetDefinition {
  type: WidgetType
  label: string
  description: string
  defaultCols: number
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    type: 'spending_summary',
    label: 'Spending Summary',
    description: 'Net balance, total income, and total expenses at a glance',
    defaultCols: 12,
  },
  {
    type: 'recent_transactions',
    label: 'Recent Transactions',
    description: 'A scrollable list of your latest transactions',
    defaultCols: 7,
  },
  {
    type: 'add_transaction',
    label: 'Add Transaction',
    description: 'Quick-entry form to log a new expense or income',
    defaultCols: 5,
  },
  {
    type: 'quick_add',
    label: 'Quick Add',
    description: 'One-tap shortcuts from your recurring and recent transactions',
    defaultCols: 5,
  },
]

export interface WidgetInstance {
  id: string
  type: WidgetType
  cols: number
}
