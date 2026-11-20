import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ThemedMascot } from '../themeAssets'
import { PAYMENT_URL } from '../pricing'

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
        <ThemedMascot size={64} radius={20} style={{ margin: '0 auto 14px'  }} />
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Your 30-day trial has ended</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 18, lineHeight: 1.5 }}>
          Everything else is on hold until you get the full digital planner (on sale ₱299, regular ₱399). Calendar and Quick To-Do (on your Hub) still work in the meantime. Please pay with your account email.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>Buy now — ₱299</a>
          <Link to="/hub" className="btn-secondary" style={{ textDecoration: 'none' }}>Go to Hub</Link>
          <Link to="/calendar" className="btn-ghost" style={{ textDecoration: 'none' }}>Open Calendar</Link>
        </div>
        <button className="btn-ghost" onClick={signOut}>Sign out</button>
      </div>
    </div>
  )
}
