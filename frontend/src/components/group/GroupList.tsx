import { useState } from 'react'
import type { Group } from '../../types'
import { groupStyles } from './groupStyles'

interface Props {
  groups: Group[]
  loading: boolean
  currentUserId: string
  onSelect: (id: string) => void
  onCreateGroup: () => void
  onJoinGroup: () => void
}

// Deterministic hue 0–359 from group name
function groupHue(name: string): number {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

// 1–2 char initials from group name
function groupInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

// Single char initial for member avatar dot
function memberInitial(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? '?'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CopyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1.5"/>
      <path d="M1 8V2a1 1 0 011-1h6"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5"/>
    </svg>
  )
}

export default function GroupList({ groups, loading, onSelect, onCreateGroup, onJoinGroup }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function copyCode(e: React.MouseEvent, code: string, id: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="gl-skeleton" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="group-empty-state">
        <div className="group-empty-state-icon">💸</div>
        <h3>No groups yet</h3>
        <p>Create a group to start splitting expenses with friends, roommates, or travel companions.</p>
        <div className="group-empty-actions">
          <button className="group-btn-primary" onClick={onCreateGroup}>+ Create group</button>
          <button className="group-btn-secondary" onClick={onJoinGroup}>Join with code</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{groupStyles}</style>
      {groups.map((g, i) => {
        const hue = groupHue(g.name)
        const accent       = `hsl(${hue}, 62%, 58%)`
        const accentDark   = `hsl(${hue}, 45%, 32%)`
        const memberCount   = g.member_count ?? 0
        const preview       = g.members_preview ?? []
        const overflow      = memberCount > 4 ? memberCount - 4 : 0
        const isCopied      = copiedId === g.id

        return (
          <div
            key={g.id}
            className="gl-card"
            style={{
              '--gl-accent': accent,
              '--gl-accent-dark': accentDark,
              '--gl-hue': String(hue),
              animationDelay: `${i * 55}ms`,
            } as React.CSSProperties}
            onClick={() => onSelect(g.id)}
          >
            {/* Colored left bar */}
            <div className="gl-bar" />

            {/* Avatar */}
            <div className="gl-avatar">
              {groupInitials(g.name)}
            </div>

            {/* Main content */}
            <div className="gl-body">
              <div className="gl-top-row">
                <span className="gl-name">{g.name}</span>
                <svg className="gl-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 3l4 4-4 4"/>
                </svg>
              </div>

              <div className="gl-meta-row">
                <span className="gl-date">Created {formatDate(g.created_at)}</span>
                <span className="gl-member-count">
                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>

              <div className="gl-footer">
                {/* Member avatar dots */}
                <div className="gl-dots">
                  {preview.map((name, di) => (
                    <div key={di} className="gl-dot" style={{ zIndex: preview.length - di }}
                      title={name}>
                      {memberInitial(name)}
                    </div>
                  ))}
                  {overflow > 0 && (
                    <div className="gl-dot-overflow">+{overflow}</div>
                  )}
                </div>

                <div className="gl-sep" />

                {/* Invite code */}
                <div className="gl-invite" onClick={e => e.stopPropagation()}>
                  <span className="gl-code">{g.invite_code}</span>
                  <button
                    className={`gl-copy-btn${isCopied ? ' copied' : ''}`}
                    onClick={e => copyCode(e, g.invite_code, g.id)}
                    title="Copy invite code"
                  >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
