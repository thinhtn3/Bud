import { useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../lib/api'
import type { Group } from '../../types'
import { splitStyles } from './splitStyles'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (group: Group) => void
}

export default function CreateGroupModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const group = await api.post<Group>('/api/groups', { name: name.trim() })
      setName('')
      onCreated(group)
    } catch {
      setError('Could not create group. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <>
      <style>{splitStyles}</style>
      <div className="split-modal-overlay" onClick={onClose}>
        <div className="split-modal split-root" onClick={e => e.stopPropagation()}>
          <div className="split-modal-title">Create a group</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="split-field">
              <label className="split-label">Group name</label>
              <input
                className="split-input"
                placeholder="e.g. Vegas Trip, Housemates"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            {error && <div className="split-error">{error}</div>}
            <div className="split-modal-footer">
              <button type="button" className="split-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="split-btn-primary" disabled={loading || !name.trim()}>
                {loading ? 'Creating…' : 'Create group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  )
}
