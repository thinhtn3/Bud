import { useState } from 'react'
import type { Group } from '../../types'
import { splitStyles } from './splitStyles'

interface Props {
  groups: Group[]
  loading: boolean
  currentUserId: string
  onSelect: (id: string) => void
  onCreateGroup: () => void
  onJoinGroup: () => void
}

export default function GroupList({ groups, loading, onSelect, onCreateGroup, onJoinGroup }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function copyCode(e: React.MouseEvent, code: string, id: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            height: 100,
            borderRadius: 16,
            background: 'rgba(247,248,248,0.03)',
            border: '1px solid rgba(247,248,248,0.07)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="split-empty-state">
        <div className="split-empty-state-icon">💸</div>
        <h3>No groups yet</h3>
        <p>Create a group to start splitting expenses with friends, roommates, or travel companions.</p>
        <div className="split-empty-actions">
          <button className="split-btn-primary" onClick={onCreateGroup}>Create group</button>
          <button className="split-btn-secondary" onClick={onJoinGroup}>Join with code</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{splitStyles}</style>
      {groups.map(g => (
        <div key={g.id} className="split-group-card" onClick={() => onSelect(g.id)}>
          <div className="split-group-card-header">
            <div className="split-group-card-name">{g.name}</div>
            <div className="split-group-card-meta">
              <span>{g.member_count ?? 0} {g.member_count === 1 ? 'member' : 'members'}</span>
              <span>{formatDate(g.created_at)}</span>
            </div>
          </div>
          <div className="split-invite-code-row" onClick={e => e.stopPropagation()}>
            <span className="split-invite-code">{g.invite_code}</span>
            <button
              className={`split-copy-btn ${copiedId === g.id ? 'copied' : ''}`}
              onClick={e => copyCode(e, g.invite_code, g.id)}
            >
              {copiedId === g.id ? 'Copied!' : 'Copy invite'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
