import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const MODULES = [
  { key: 'hub', label: 'Home', icon: '🏠', path: '/hub', available: true },
  { key: 'calendar', label: 'Calendar', icon: '🗓️', path: '/calendar', available: true },
  { key: 'mood', label: 'Mood Tracker', icon: '💭', path: '/mood', available: false },
  { key: 'feeling', label: 'How Are You Feeling?', icon: '🌸', path: '/feeling', available: false },
  { key: 'budget', label: 'Budgeting', icon: '💰', path: '/budget', available: false },
  { key: 'recipes', label: 'Recipes', icon: '🍲', path: '/recipes', available: false },
  { key: 'fitness', label: 'Fitness Tracker', icon: '🏃‍♀️', path: '/fitness', available: false },
  { key: 'sleep', label: 'Sleep Tracker', icon: '😴', path: '/sleep', available: false },
  { key: 'selfcare', label: 'Self-Care Challenge', icon: '🧖‍♀️', path: '/selfcare', available: false },
  { key: 'grocery', label: 'Grocery List', icon: '🛒', path: '/grocery', available: false },
  { key: 'projects', label: 'Project Planner', icon: '📋', path: '/projects', available: false },
  { key: 'travel', label: 'Travel Planner', icon: '✈️', path: '/travel', available: false },
  { key: 'notebooks', label: 'Notebooks', icon: '📓', path: '/notebooks', available: false },
]

export default function SidebarLayout({ children, title }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sidebarContent = (
    <>
      <div style={{ textAlign: 'center', padding: '26px 16px 18px' }}>
        <div
          aria-hidden
          style={{
            width: 52, height: 52, margin: '0 auto 10px', borderRadius: 16,
            background: 'var(--teal-500)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 26,
          }}
        >
          🐾
        </div>
        <div className="display" style={{ fontSize: 16, color: 'white' }}>My Purrsonal Planner</div>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
        {MODULES.map((m) => {
          const active = location.pathname === m.path
          return (
            <Link
              key={m.key}
              to={m.path}
              onClick={() => setDrawerOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 12px', marginBottom: 3, borderRadius: 12,
                textDecoration: 'none', fontSize: 14, fontWeight: active ? 700 : 600,
                color: active ? 'var(--teal-900)' : 'rgba(255,255,255,0.88)',
                background: active ? 'var(--pink-300)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 17 }}>{m.icon}</span>
              <span style={{ flex: 1 }}>{m.label}</span>
              {!m.available && (
                <span style={{ fontSize: 10, opacity: 0.75 }}>soon</span>
              )}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ color: 'white', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
          {profile?.name ? `Hi, ${profile.name} 🌷` : 'Welcome!'}
        </div>
        <button onClick={signOut} className="btn-ghost" style={{ color: 'rgba(255,255,255,0.85)', padding: '4px 0' }}>
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Desktop sidebar */}
      <aside
        style={{
          width: 240, background: 'var(--teal-700)', display: 'flex',
          flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
        }}
        className="desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40 }}
          className="mobile-only"
        />
      )}
      <aside
        className="mobile-drawer mobile-only"
        style={{
          width: 240, background: 'var(--teal-700)', display: 'flex',
          flexDirection: 'column', position: 'fixed', top: 0, left: drawerOpen ? 0 : -260,
          height: '100vh', zIndex: 50, transition: 'left 0.2s ease',
        }}
      >
        {sidebarContent}
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        <div
          className="mobile-only"
          style={{
            display: 'none', alignItems: 'center', gap: 12, padding: '14px 16px',
            background: 'white', borderBottom: '2px solid var(--teal-100)', position: 'sticky', top: 0, zIndex: 20,
          }}
        >
          <button onClick={() => setDrawerOpen(true)} className="btn-ghost" style={{ fontSize: 22, padding: 0 }} aria-label="Open menu">
            ☰
          </button>
          <h1 style={{ fontSize: 17 }}>{title}</h1>
        </div>
        <div style={{ padding: '28px 32px 60px' }} className="content-pad">
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 860px) {
          .desktop-sidebar { display: none; }
          .mobile-only { display: flex !important; }
          .content-pad { padding: 20px 16px 60px !important; }
        }
        @media (min-width: 861px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  )
}
