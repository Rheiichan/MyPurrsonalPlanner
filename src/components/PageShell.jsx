import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HeaderIcon, PageBanner, ThemeHeader } from '../themeAssets'
import { IconHome } from './icons'

export default function PageShell({ children, title }) {
  const { signOut, isAdmin } = useAuth()
  const route = useLocation().pathname.split('/')[1]
  // Pages whose colors should turn monochrome in the Black & White theme
  const grayClass = ['mood', 'selfcare'].includes(route) ? 'mono-gray' : undefined

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
          background: 'var(--teal-700)', position: 'sticky', top: 0, zIndex: 20,
        }}
      >
        <Link to="/hub" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <HeaderIcon size={34} radius={10} />
          <span className="display" style={{ fontSize: 15, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconHome style={{ color: 'inherit' }} /> Home
          </span>
        </Link>
        <div style={{ flex: 1 }} />
        {isAdmin && (
          <Link to="/admin" className="btn-ghost" style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700 }}>
            Admin
          </Link>
        )}
        <button onClick={signOut} className="btn-ghost" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          Sign out
        </button>
      </header>
      <div style={{ padding: '28px 32px 60px' }} className="content-pad">
        <ThemeHeader />
        <PageBanner />
        <div className={grayClass}>{children}</div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .content-pad { padding: 20px 16px 60px !important; }
        }
      `}</style>
    </div>
  )
}
