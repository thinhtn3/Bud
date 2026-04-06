import { useState, useEffect, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Dropdown } from '@/components/ui/Dropdown'
import { Tag } from 'lucide-react'
import { getCategoryIcon } from '@/components/widgets/categoryIcons'
import type { Transaction } from '@/types'

interface Props {
  transaction: Transaction
  onSave: (updated: Transaction) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function EditTransactionModal({ transaction: tx, onSave, onDelete, onClose }: Props) {
  const { user } = useAuth()

  const [type, setType]               = useState(tx.type)
  const [name, setName]               = useState(tx.name)
  const [amount, setAmount]           = useState(String(tx.amount))
  const [date, setDate]               = useState(tx.date)
  const [categoryId, setCategoryId]   = useState(tx.category_id ?? '')
  const [description, setDescription] = useState(tx.description ?? '')
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const updated = await api.patch<Transaction>(`/api/transactions/${tx.id}`, {
        type,
        name,
        amount: parseFloat(amount),
        date,
        category_id: categoryId || null,
        description: description || null,
      })
      onSave(updated)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${tx.name}"?`)) return
    setError(null)
    setDeleting(true)
    try {
      await api.delete(`/api/transactions/${tx.id}`)
      onDelete(tx.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
      setDeleting(false)
    }
  }

  const busy = saving || deleting

  return createPortal(
    <div className="bud-modal-overlay" onPointerDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bud-modal" role="dialog" aria-modal="true" aria-label="Edit transaction">

        <div className="bud-modal-header">
          <p className="bud-modal-title">Edit Transaction</p>
          <button className="bud-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Type toggle */}
        <div className="bud-toggle" data-active={type} style={{ marginBottom: 18 }}>
          <div className="bud-toggle-thumb" />
          {(['expense', 'income'] as const).map(t => (
            <button
              key={t}
              type="button"
              data-value={t}
              onClick={() => setType(t)}
              className="bud-toggle-btn"
            >
              {t}
            </button>
          ))}
        </div>

        <form className="bud-form" onSubmit={handleSave}>
          <input
            required
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bud-input"
          />

          <div className="bud-input-row">
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bud-input"
            />
            <input
              required
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bud-input"
            />
          </div>

          <Dropdown
            value={categoryId || undefined}
            onChange={setCategoryId}
            placeholder="No category"
            searchable
            maxVisibleItems={4}
            options={[
              { value: '', label: 'No category', icon: <Tag size={13} /> },
              ...(user?.categories ?? []).map(cat => {
                const Icon = getCategoryIcon(cat.name)
                return { value: cat.id, label: cat.name, icon: <Icon size={13} /> }
              }),
            ]}
          />

          <input
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="bud-input"
          />

          {error && <p className="bud-error">{error}</p>}

          <div className="bud-modal-actions">
            <button
              type="submit"
              disabled={busy}
              className="bud-modal-save"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              disabled={busy}
              className="bud-modal-delete"
              onClick={handleDelete}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body,
  )
}
