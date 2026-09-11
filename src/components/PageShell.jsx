import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import mascot from '../assets/mascot.png'
import { IconHome, IconProfile } from './icons'

export default function PageShell({ children, title }) {
  const { signOut, isAdmin } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
          background: 'var(--teal-700)', position: 'sticky', top: 0, zIndex: 20,
        }}
      >
        <Link to="/hub" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src={mascot} alt="" aria-hidden style={{ width: 34, height: 34, borderRadius: 10 }} />
          <span className="display" style={{ fontSize: 15, color: 'white' }}>{title}</span>
        </Link>
        <div style={{ flex: 1 }} />
        {isAdmin && (
          <Link to="/admin" className="btn-ghost" style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 700 }}>
            Admin
          </Link>
        )}
        <Link
          to="/profile"
          className="btn-ghost"
          style={{ color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}
        >
          <IconProfile style={{ color: 'inherit' }} /> My Profile
        </Link>
        <Link
          to="/hub"
          className="btn-ghost"
          style={{ color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}
        >
          <IconHome style={{ color: 'inherit' }} /> Home
        </Link>
        <button onClick={signOut} className="btn-ghost" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          Sign out
        </button>
      </header>
      <div style={{ padding: '28px 32px 60px' }} className="content-pad">
        {children}
      </div>
      <style>{`
        @media (max-width: 640px) {
          .content-pad { padding: 20px 16px 60px !important; }
        }
      `}</style>
    </div>
  )
}
