import { useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../lib/api'
import type { Group } from '../../types'
import { groupStyles } from './groupStyles'

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
      <style>{groupStyles}</style>
      <div className="group-modal-overlay" onClick={onClose}>
        <div className="group-modal group-root" onClick={e => e.stopPropagation()}>
          <div className="group-modal-title">Create a group</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="group-field">
              <label className="group-label">Group name</label>
              <input
                className="group-input"
                placeholder="e.g. Vegas Trip, Housemates"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            {error && <div className="group-error">{error}</div>}
            <div className="group-modal-footer">
              <button type="button" className="group-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="group-btn-primary" disabled={loading || !name.trim()}>
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
