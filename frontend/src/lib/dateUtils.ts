// Parse a YYYY-MM-DD string as a local-time date, not UTC.
// `new Date('2026-04-15')` is parsed as UTC midnight and can land on April 14
// in negative-offset timezones. This avoids that.
export function parseLocalDate(dateStr: string): Date {
  // Backend returns full RFC3339 ("2026-04-15T00:00:00Z") — strip time part if present
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
  const [y, m, d] = datePart.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getLocalMonthBounds(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start, end }
}

export function filterThisMonth<T extends { date: string }>(items: T[]): T[] {
  const { start, end } = getLocalMonthBounds()
  return items.filter(item => {
    const d = parseLocalDate(item.date)
    return d >= start && d < end
  })
}

// Filter to an arbitrary month (0-indexed month, e.g. 0 = January)
export function filterByMonth<T extends { date: string }>(items: T[], year: number, month: number): T[] {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 1)
  return items.filter(item => {
    const d = parseLocalDate(item.date)
    return d >= start && d < end
  })
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`
}
