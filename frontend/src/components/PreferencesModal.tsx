import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import { CreditCard, Plus, Trash2, Edit2, X, Check } from 'lucide-react'
import { getCardNetworkIcon } from '@/components/widgets/CardAliasDropdown'

interface Props {
  onClose: () => void
}

const PERIODS = ['weekly', 'biweekly', 'monthly'] as const
type Period = typeof PERIODS[number]

const CARD_NETWORKS = ['visa', 'mastercard', 'amex', 'discover', 'other'] as const
const CARD_TYPES = ['credit', 'debit', 'prepaid', 'other'] as const
const CARD_COLORS = ['#9fe870', '#d03238', '#5e6ad2', '#ffd11a', '#2dd4bf', '#f7f8f8', '#8a8f98']

export function PreferencesModal({ onClose }: Props) {
  const { user, addCardAlias, updateCardAlias, deleteCardAlias } = useAuth()

  const [period, setPeriod]     = useState<Period>('monthly')
  const [amount, setAmount]     = useState('')
  const [carryOver, setCarryOver] = useState(false)
  const [income, setIncome]     = useState('')

  // Card Alias Form State
  const [showCardForm, setShowCardForm] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [cardName, setCardName] = useState('')
  const [cardNetwork, setCardNetwork] = useState<typeof CARD_NETWORKS[number]>('visa')
  const [cardType, setCardType] = useState<typeof CARD_TYPES[number]>('credit')
  const [last4, setLast4] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cardColor, setCardColor] = useState(CARD_COLORS[0])
  const [cardLoading, setCardLoading] = useState(false)

  // Seed local state from user preferences on mount
  useEffect(() => {
    if (!user?.preferences) return
    const p = user.preferences
    setPeriod((PERIODS.includes(p.budget_period as Period) ? p.budget_period : 'monthly') as Period)
    setAmount(p.budget_amount > 0 ? String(p.budget_amount) : '')
    setCarryOver(p.carry_over_excess)
    setIncome(p.monthly_income != null ? String(p.monthly_income) : '')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSave() {
    // TODO: wire up api.put('/api/me/preferences', { budget_period: period, budget_amount: Number(amount), carry_over_excess: carryOver, monthly_income: income ? Number(income) : null, ... }) + refreshUser()
    onClose()
  }

  async function handleCardSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCardLoading(true)
    try {
      const cardData = {
        card_name: cardName,
        card_network: cardNetwork,
        card_type: cardType,
        last4: last4 || null,
        expiry: expiry || null,
        color: cardColor,
      }

      if (editingCardId) {
        await updateCardAlias(editingCardId, cardData)
      } else {
        await addCardAlias(cardData)
      }
      resetCardForm()
    } catch (err) {
      console.error(err)
    } finally {
      setCardLoading(false)
    }
  }

  function resetCardForm() {
    setCardName('')
    setCardNetwork('visa')
    setCardType('credit')
    setLast4('')
    setExpiry('')
    setCardColor(CARD_COLORS[0])
    setEditingCardId(null)
    setShowCardForm(false)
  }

  function handleEditCard(card: any) {
    setCardName(card.card_name)
    setCardNetwork(card.card_network)
    setCardType(card.card_type)
    setLast4(card.last4 ?? '')
    setExpiry(card.expiry ?? '')
    setCardColor(card.color)
    setEditingCardId(card.id)
    setShowCardForm(true)
  }

  async function handleDeleteCard(id: string) {
    if (!window.confirm('Delete this card alias?')) return
    try {
      await deleteCardAlias(id)
    } catch (err) {
      console.error(err)
    }
  }

  return createPortal(
    <div
      className="bud-modal-overlay"
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bud-prefs-modal"
        role="dialog"
        aria-modal
        aria-label="Preferences"
        style={{ maxWidth: 460 }}
      >
        <div className="bud-modal-header">
          <span className="bud-modal-title">Preferences & Cards</span>
          <button className="bud-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 4, marginRight: -4 }}>
          {/* Budget period */}
          <p className="bud-prefs-label" style={{ marginBottom: 6 }}>Budget period</p>
          <div className="bud-prefs-segment">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                className={`bud-prefs-seg-btn${period === p ? ' active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="bud-prefs-section">
            {/* Budget amount */}
            <div className="bud-prefs-row">
              <div>
                <p className="bud-prefs-label">Budget amount</p>
                <p className="bud-prefs-hint">Per {period} period</p>
              </div>
              <div className="bud-prefs-input-wrap">
                <span className="bud-prefs-input-prefix">$</span>
                <input
                  type="number"
                  className="bud-prefs-input"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Carry over */}
            <div className="bud-prefs-row" style={{ marginTop: 14 }}>
              <div>
                <p className="bud-prefs-label">Carry over excess</p>
                <p className="bud-prefs-hint">Roll unspent budget into next period</p>
              </div>
              <button
                type="button"
                className={`bud-prefs-switch${carryOver ? ' on' : ''}`}
                role="switch"
                aria-checked={carryOver}
                onClick={() => setCarryOver(!carryOver)}
              />
            </div>
          </div>

          {/* Card Aliases Section */}
          <div className="bud-prefs-section">
            <div className="bud-modal-header" style={{ marginBottom: 12, marginTop: 4 }}>
              <p className="bud-prefs-label" style={{ color: '#f7f8f8', fontWeight: 510 }}>Card Aliases</p>
              {!showCardForm && (
                <button
                  className="bud-add-widget-btn"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => setShowCardForm(true)}
                >
                  <Plus size={12} /> Add Card
                </button>
              )}
            </div>

            {showCardForm ? (
              <form className="bud-card-form" onSubmit={handleCardSubmit}>
                <div className="bud-modal-header" style={{ marginBottom: 8 }}>
                  <p className="bud-card-name" style={{ fontSize: 13 }}>{editingCardId ? 'Edit Card' : 'New Card'}</p>
                  <button type="button" className="bud-qa-dismiss" onClick={resetCardForm}><X size={14} /></button>
                </div>

                <input
                  required
                  placeholder="Card Name (e.g. Main Chase)"
                  className="bud-input"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />

                <div className="bud-card-form-grid">
                  <select
                    className="bud-select"
                    value={cardNetwork}
                    onChange={e => setCardNetwork(e.target.value as any)}
                  >
                    {CARD_NETWORKS.map(n => <option key={n} value={n}>{n.toUpperCase()}</option>)}
                  </select>
                  <select
                    className="bud-select"
                    value={cardType}
                    onChange={e => setCardType(e.target.value as any)}
                  >
                    {CARD_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>

                <div className="bud-card-form-grid">
                  <input
                    placeholder="Last 4 digits"
                    className="bud-input"
                    maxLength={4}
                    value={last4}
                    onChange={e => setLast4(e.target.value.replace(/\D/g, ''))}
                  />
                  <input
                    placeholder="Expiry (MM/YY)"
                    className="bud-input"
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                  />
                </div>

                <div>
                  <p className="bud-prefs-hint" style={{ marginBottom: 6 }}>Card Color</p>
                  <div className="bud-color-picker">
                    {CARD_COLORS.map(c => (
                      <div
                        key={c}
                        className={`bud-color-swatch${cardColor === c ? ' active' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setCardColor(c)}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="bud-modal-save" disabled={cardLoading} style={{ marginTop: 4 }}>
                  {cardLoading ? 'Saving...' : editingCardId ? 'Update Card' : 'Add Card'}
                </button>
              </form>
            ) : (
              <div className="bud-card-list">
                {user?.card_aliases?.length === 0 ? (
                  <p className="bud-prefs-hint" style={{ textAlign: 'center', padding: '12px 0' }}>No cards added yet.</p>
                ) : (
                  user?.card_aliases?.map(card => (
                    <div key={card.id} className="bud-card-item">
                      <div className="bud-card-info">
                        <div className="bud-card-icon">
                          {getCardNetworkIcon(card.card_network, 40)}
                        </div>
                        <div className="bud-card-meta">
                          <p className="bud-card-name">{card.card_name}</p>
                          <p className="bud-card-sub">
                            {card.card_network} • {card.card_type}
                            {card.last4 ? ` • **** ${card.last4}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="bud-card-actions">
                        <button className="bud-card-action-btn" onClick={() => handleEditCard(card)}><Edit2 size={13} /></button>
                        <button className="bud-card-action-btn delete" onClick={() => handleDeleteCard(card.id)}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="bud-prefs-section">
            {/* Monthly income */}
            <div className="bud-prefs-row">
              <p className="bud-prefs-label">Monthly income</p>
              <div className="bud-prefs-input-wrap">
                <span className="bud-prefs-input-prefix">$</span>
                <input
                  type="number"
                  className="bud-prefs-input"
                  placeholder="Optional"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Currency (read-only) */}
            <div className="bud-prefs-row" style={{ marginTop: 14 }}>
              <p className="bud-prefs-label">Currency</p>
              <span className="bud-prefs-badge">{user?.preferences?.currency ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="bud-modal-actions" style={{ marginTop: 24 }}>
          <button type="button" className="bud-prefs-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="bud-modal-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
