import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.25"/>
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.25"/>
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.25"/>
        <rect x="9" y="9" width="5.5" height="5.5" rx="1.25"/>
      </svg>
    ),
  },
  {
    path: '/group',
    label: 'Groups',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="5.5" r="2.5"/>
        <circle cx="11" cy="5.5" r="2.5"/>
        <path d="M1 13.5c0-2.21 1.79-4 4-4s4 1.79 4 4"/>
        <path d="M11 9.5c2.21 0 4 1.79 4 4"/>
      </svg>
    ),
  },
]

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <nav className="bud-navbar">
      {/* Brand */}
      <div className="bud-nav-brand">
        <div className="bud-nav-brand-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 16C9 16 3 12 3 7.5C3 4.462 5.686 2 9 2C12.314 2 15 4.462 15 7.5C15 12 9 16 9 16Z"
              fill="#9fe870"
              fillOpacity="0.12"
              stroke="#9fe870"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 16V8.5M9 8.5C9 8.5 6.5 7 6.5 5M9 8.5C9 8.5 11.5 7 11.5 5"
              stroke="#9fe870"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="bud-nav-brand-name">Bud</span>
      </div>

      {/* Nav items */}
      <div className="bud-nav-items">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)
          return (
            <button
              key={item.path}
              className={`bud-nav-item${isActive ? ' bud-nav-item--active' : ''}`}
              aria-label={item.label}
              onClick={() => navigate(item.path)}
            >
              <span className="bud-nav-item-icon">{item.icon}</span>
              <span className="bud-nav-item-label">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Profile block */}
      <div className="bud-nav-profile-wrap">
        <div className="bud-nav-profile">
          <div className="bud-nav-avatar">{getInitials(user?.display_name)}</div>
          <div className="bud-nav-profile-info">
            <span className="bud-nav-profile-name">{user?.display_name ?? '—'}</span>
            <span className="bud-nav-profile-email">{user?.email ?? ''}</span>
          </div>
          <button
            className="bud-nav-signout-btn"
            aria-label="Sign out"
            onClick={logout}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.5"/>
              <path d="M9.5 10L12 7l-2.5-3"/>
              <path d="M12 7H5.5"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
