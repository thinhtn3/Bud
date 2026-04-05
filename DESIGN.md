# Design System: Bud

> Linear's dark precision + Wise's financial confidence.
> Linear owns the structure, spacing, and elevation model. Wise owns financial numbers, amounts, CTAs, and status colors.

---

## 1. Visual Theme & Atmosphere

Bud is a dark-mode-first personal finance app. The canvas is near-black (`#08090a`) — information emerges from darkness like a terminal. Structure comes from luminance stacking (Linear), not borders or shadows. Financial data — balances, amounts, income, expenses — is the hero: large, bold, colour-coded, impossible to miss (Wise).

The typography is Inter Variable with OpenType features `"cv01", "ss03"` globally, giving it a clean geometric character. Display financial figures use aggressive negative letter-spacing. Amounts use weight 900 for the number itself (Wise influence) but sit within Linear's dark panel system.

The colour system is almost entirely achromatic (dark backgrounds, white-gray text) with two accent exceptions:
- **Wise Green** (`#9fe870`) — income, positive balances, primary CTAs
- **Linear Indigo** (`#5e6ad2` / `#7170ff`) — interactive elements, links, active states
- **Danger Red** (`#d03238`) — expenses, negative balances, destructive actions

---

## 2. Color Palette & Roles

### Backgrounds (Linear)
| Token | Value | Use |
|---|---|---|
| `bg-canvas` | `#08090a` | Page background, deepest canvas |
| `bg-panel` | `#0f1011` | Sidebar, panels |
| `bg-surface` | `#191a1b` | Cards, dropdowns, elevated surfaces |
| `bg-elevated` | `#28282c` | Hover states, highest elevation |

### Text (Linear)
| Token | Value | Use |
|---|---|---|
| `text-primary` | `#f7f8f8` | Headlines, labels |
| `text-secondary` | `#d0d6e0` | Body, descriptions |
| `text-muted` | `#8a8f98` | Placeholders, metadata |
| `text-subtle` | `#62666d` | Timestamps, disabled |

### Financial / Semantic (Wise)
| Token | Value | Use |
|---|---|---|
| `income-green` | `#9fe870` | Income amounts, positive balances, CTAs |
| `income-text` | `#163300` | Text on green backgrounds |
| `income-surface` | `#e2f6d5` | Subtle income tint |
| `expense-red` | `#d03238` | Expense amounts, negative balances |
| `warning-yellow` | `#ffd11a` | Budget warnings |

### Interactive (Linear)
| Token | Value | Use |
|---|---|---|
| `accent` | `#5e6ad2` | Primary interactive surfaces |
| `accent-bright` | `#7170ff` | Links, active states |
| `accent-hover` | `#828fff` | Hover on accent elements |

### Borders (Linear)
| Token | Value | Use |
|---|---|---|
| `border-subtle` | `rgba(255,255,255,0.05)` | Default card borders |
| `border-standard` | `rgba(255,255,255,0.08)` | Input, prominent containers |
| `border-solid` | `#23252a` | Dividers |

---

## 3. Typography

**Font**: `Inter Variable`, fallback: `SF Pro Display, -apple-system`
**OpenType**: `"cv01", "ss03"` on ALL text — non-negotiable
**Monospace**: `Berkeley Mono` for amounts in monospace contexts

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| Financial Hero | 48px | 900 | 1.00 | -1.056px | Balance totals, hero amounts |
| Financial Large | 32px | 900 | 1.00 | -0.704px | Widget stat numbers |
| Financial Medium | 24px | 700 | 1.20 | -0.288px | Transaction amounts |
| Display | 48px | 510 | 1.00 | -1.056px | Section headlines |
| Heading 1 | 32px | 510 | 1.13 | -0.704px | Page titles |
| Heading 2 | 24px | 510 | 1.33 | -0.288px | Widget titles, card headers |
| Heading 3 | 20px | 590 | 1.33 | -0.240px | Sub-headers |
| Body | 16px | 400 | 1.50 | normal | Standard reading |
| Body Medium | 16px | 510 | 1.50 | normal | Navigation, labels |
| Small | 15px | 400 | 1.60 | -0.165px | Secondary body |
| Caption | 13px | 400–510 | 1.50 | -0.130px | Dates, metadata |
| Label | 12px | 510 | 1.40 | normal | Tags, badges |

### Financial Number Principle (Wise)
- Balance and total amounts use weight 900 — the number is the most important element on the screen
- Amounts are always `Berkeley Mono` or Inter Variable weight 900 with letter-spacing -0.704px+
- Positive amounts: `#9fe870` (income green)
- Negative amounts: `#d03238` (expense red)
- Neutral / balance: `#f7f8f8`

---

## 4. Component Styles

### Buttons

**Primary (Income Green — Wise)**
- Background: `#9fe870`
- Text: `#163300`
- Padding: `8px 20px`
- Radius: `9999px` (pill)
- Hover: `scale(1.05)`
- Active: `scale(0.95)`
- Use: Primary CTAs (Add Transaction, Save)

**Secondary Ghost (Linear)**
- Background: `rgba(255,255,255,0.02)`
- Text: `#d0d6e0`
- Border: `1px solid rgba(255,255,255,0.08)`
- Padding: `8px 16px`
- Radius: `6px`
- Use: Cancel, secondary actions

**Destructive**
- Background: `rgba(208,50,56,0.12)`
- Text: `#d03238`
- Border: `1px solid rgba(208,50,56,0.24)`
- Radius: `6px`
- Use: Delete, remove

### Cards / Widgets (Linear)
- Background: `rgba(255,255,255,0.02)`
- Border: `1px solid rgba(255,255,255,0.08)`
- Radius: `12px`
- Hover: background → `rgba(255,255,255,0.04)`
- Padding: `20px 24px`

### Inputs (Linear)
- Background: `rgba(255,255,255,0.02)`
- Text: `#f7f8f8`
- Placeholder: `#8a8f98`
- Border: `1px solid rgba(255,255,255,0.08)`
- Radius: `6px`
- Padding: `10px 14px`
- Focus: `1px solid rgba(255,255,255,0.16)` + `rgba(0,0,0,0.1) 0px 4px 12px`

### Type Toggle (Expense / Income)
- Container: `rgba(255,255,255,0.02)` bg, `1px solid rgba(255,255,255,0.08)` border, `9999px` radius
- Expense active: `#d03238` bg, `#f7f8f8` text
- Income active: `#9fe870` bg, `#163300` text
- Inactive: transparent, `#8a8f98` text

### Transaction List Item
- Background: transparent
- Hover: `rgba(255,255,255,0.02)`
- Radius: `6px`
- Name: 15px weight 510, `#f7f8f8`
- Date/category: 12px weight 400, `#62666d`
- Amount: 15px weight 700, `#9fe870` (income) or `#d03238` (expense), `Berkeley Mono`

### Badges / Pills
- Category pill: transparent bg, `#d0d6e0` text, `1px solid #23252a`, `9999px` radius, 11px weight 510
- Income badge: `#163300` bg, `#9fe870` text, `9999px` radius
- Expense badge: `rgba(208,50,56,0.12)` bg, `#d03238` text, `9999px` radius

---

## 5. Layout & Spacing

**Base unit**: 8px
**Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px

**Widget grid**: 12-column snap grid. Widgets snap to grid cells on move and resize.

**Page max-width**: 1280px, centered
**Page padding**: 24px (mobile), 40px (desktop)
**Widget gap**: 16px

---

## 6. Depth & Elevation (Linear)

| Level | Treatment | Use |
|---|---|---|
| Canvas | `#08090a` — no shadow | Page background |
| Surface | `rgba(255,255,255,0.02)` bg + `rgba(255,255,255,0.08)` border | Cards, widgets |
| Elevated | `rgba(255,255,255,0.04)` bg + border | Hover state, focused cards |
| Float | `rgba(0,0,0,0.4) 0px 2px 4px` | Dropdowns, popovers |
| Dialog | Multi-layer stack | Modals |

---

## 7. Do's and Don'ts

### Do
- Use Inter Variable with `"cv01", "ss03"` on all text
- Use weight 900 for financial hero numbers — the amount IS the UI
- Use `#9fe870` for income and positive CTAs, `#d03238` for expenses
- Use luminance stacking for elevation — never solid colored backgrounds on dark surfaces
- Use `rgba(255,255,255,0.05–0.08)` semi-transparent borders — never opaque dark borders
- Use `Berkeley Mono` or weight 900 Inter for amounts
- Pill buttons for primary CTAs (Wise), 6px radius for secondary/ghost (Linear)
- Colour-code every amount: green = in, red = out, white = neutral

### Don't
- Don't use light mode — this is dark-mode-first
- Don't use pure `#ffffff` for text — use `#f7f8f8`
- Don't use weight 700+ for non-financial text — 510 is the UI workhorse
- Don't use `#9fe870` for decoration — reserved for income and primary CTAs only
- Don't show amounts without colour coding
- Don't use `#d03238` for anything other than expenses and destructive actions
- Don't use traditional drop shadows on dark surfaces — use luminance stacking

---

## 8. Agent Prompt Guide

### Quick Reference
- Page bg: `#08090a`
- Card bg: `rgba(255,255,255,0.02)` + `1px solid rgba(255,255,255,0.08)` border
- Primary text: `#f7f8f8`
- Body text: `#d0d6e0`
- Muted: `#8a8f98`
- Income / CTA: `#9fe870` (text on it: `#163300`)
- Expense: `#d03238`
- Accent: `#5e6ad2` / `#7170ff`

### Example Prompts
- "Build a balance widget: `rgba(255,255,255,0.02)` bg, `1px solid rgba(255,255,255,0.08)` border, 12px radius. Label at 13px Inter weight 510 `#8a8f98`. Amount at 48px weight 900 letter-spacing -1.056px, `#f7f8f8`. font-feature-settings `'cv01','ss03'`."
- "Build a transaction row: hover `rgba(255,255,255,0.02)` bg, 6px radius. Name 15px weight 510 `#f7f8f8`. Date 12px `#62666d`. Amount 15px weight 700 Berkeley Mono, `#9fe870` for income, `#d03238` for expense."
- "Build an add transaction form on `#0f1011` panel. Expense/income pill toggle: active expense = `#d03238` bg, active income = `#9fe870` bg `#163300` text. Inputs: `rgba(255,255,255,0.02)` bg, `1px solid rgba(255,255,255,0.08)`. Submit: `#9fe870` pill button `#163300` text, scale(1.05) hover."
