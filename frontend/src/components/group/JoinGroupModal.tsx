import { useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../lib/api'
import type { Group } from '../../types'
import { groupStyles } from './groupStyles'

interface Props {
  open: boolean
  onClose: () => void
  onJoined: (group: Group) => void
}

export default function JoinGroupModal({ open, onClose, onJoined }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const group = await api.post<Group>('/api/groups/join', { invite_code: code.trim() })
      setCode('')
      onJoined(group)
    } catch {
      setError('Invalid invite code. Check with your group and try again.')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <>
      <style>{groupStyles}</style>
      <div className="group-modal-overlay" onClick={onClose}>
        <div className="group-modal group-root" onClick={e => e.stopPropagation()}>
          <div className="group-modal-title">Join a group</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="group-field">
              <label className="group-label">Invite code</label>
              <input
                className="group-input"
                placeholder="Enter 8-character invite code"
                value={code}
                onChange={e => setCode(e.target.value)}
                autoFocus
                required
                style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: '0.06em' }}
              />
            </div>
            {error && <div className="group-error">{error}</div>}
            <div className="group-modal-footer">
              <button type="button" className="group-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="group-btn-primary" disabled={loading || !code.trim()}>
                {loading ? 'Joining…' : 'Join group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  )
}
