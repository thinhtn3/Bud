import {
  Utensils, Car, Zap, Tv, Heart, TrendingUp,
  ShoppingBag, Home, Coffee, GraduationCap,
  CreditCard, Plane, Smartphone, PiggyBank,
  Dumbbell, Music, Briefcase, Tag,
  type LucideIcon,
} from 'lucide-react'

// ── Name → Lucide icon (React contexts) ──────────────────────────────────────

const RULES: [RegExp, LucideIcon][] = [
  [/food|eat|restaurant|groceries|dining|lunch|dinner|breakfast|meal|takeaway|takeout/i, Utensils],
  [/coffee|cafe|starbucks|latte|espresso/i, Coffee],
  [/transport|travel|car|uber|lyft|taxi|commute|petrol|fuel|gas station|transit|bus|train|metro|subway/i, Car],
  [/flight|airline|airport|hotel|accommodation/i, Plane],
  [/utilit|electric|water|internet|broadband|phone bill|mobile bill/i, Zap],
  [/phone|mobile|smartphone|cellular/i, Smartphone],
  [/entertainment|movie|cinema|netflix|streaming|spotify|hulu|disney|gaming|game/i, Tv],
  [/music|concert|gig|ticket/i, Music],
  [/health|medical|doctor|hospital|pharmacy|prescription|dentist|physio/i, Heart],
  [/gym|fitness|workout|sport|crossfit|pilates|yoga/i, Dumbbell],
  [/rent|mortgage|home|house|apartment|household/i, Home],
  [/shopping|clothes|fashion|amazon|ebay|retail|department/i, ShoppingBag],
  [/education|school|university|college|course|tuition|book|textbook/i, GraduationCap],
  [/subscription|software|saas|app|membership/i, CreditCard],
  [/saving|invest|pension|retirement/i, PiggyBank],
  [/income|salary|wage|pay|revenue|freelance|client/i, TrendingUp],
  [/work|business|office|expense/i, Briefcase],
]

export function getCategoryIcon(name: string): LucideIcon {
  for (const [pattern, icon] of RULES) {
    if (pattern.test(name)) return icon
  }
  return Tag
}

// ── Name → emoji (SVG / recharts contexts) ───────────────────────────────────

const EMOJI_RULES: [RegExp, string][] = [
  [/food|eat|restaurant|groceries|dining|lunch|dinner|breakfast|meal|takeaway|takeout/i, '🍽'],
  [/coffee|cafe|starbucks|latte|espresso/i, '☕'],
  [/transport|travel|car|uber|lyft|taxi|commute|petrol|fuel|gas station|transit|bus|train|metro|subway/i, '🚗'],
  [/flight|airline|airport|hotel|accommodation/i, '✈'],
  [/utilit|electric|water|internet|broadband|phone bill|mobile bill/i, '⚡'],
  [/phone|mobile|smartphone|cellular/i, '📱'],
  [/entertainment|movie|cinema|netflix|streaming|spotify|hulu|disney|gaming|game/i, '🎬'],
  [/music|concert|gig|ticket/i, '🎵'],
  [/health|medical|doctor|hospital|pharmacy|prescription|dentist|physio/i, '❤'],
  [/gym|fitness|workout|sport|crossfit|pilates|yoga/i, '💪'],
  [/rent|mortgage|home|house|apartment|household/i, '🏠'],
  [/shopping|clothes|fashion|amazon|ebay|retail|department/i, '🛍'],
  [/education|school|university|college|course|tuition|book|textbook/i, '🎓'],
  [/subscription|software|saas|app|membership/i, '💳'],
  [/saving|invest|pension|retirement/i, '🐷'],
  [/income|salary|wage|pay|revenue|freelance|client/i, '📈'],
  [/work|business|office|expense/i, '💼'],
]

export function getCategoryEmoji(name: string): string {
  for (const [pattern, emoji] of EMOJI_RULES) {
    if (pattern.test(name)) return emoji
  }
  return '🏷'
}

export type { LucideIcon }
