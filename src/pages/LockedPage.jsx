import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import mascot from '../assets/mascot.png'

export default function LockedPage() {
  const { signOut } = useAuth()

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, var(--teal-100) 0%, var(--cream) 45%, var(--pink-100) 100%)', padding: 24,
      }}
    >
      <div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <img src={mascot} alt="" aria-hidden style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 14px' }} />
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Your 30-day trial has ended</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 18, lineHeight: 1.5 }}>
          Everything else is on hold until you upgrade to the full lifetime version. For now, contact the app
          admin to purchase — Calendar and Quick To-Do (on your Hub) still work in the meantime.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          <Link to="/hub" className="btn-primary" style={{ textDecoration: 'none' }}>Go to Hub</Link>
          <Link to="/calendar" className="btn-secondary" style={{ textDecoration: 'none' }}>Open Calendar</Link>
        </div>
        <button className="btn-ghost" onClick={signOut}>Sign out</button>
      </div>
    </div>
  )
}
