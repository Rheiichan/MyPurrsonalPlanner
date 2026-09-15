import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthShell from '../components/AuthShell'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError("Passwords don't match")
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // If email confirmation is off in Supabase, signUp already returns a
    // live session — trial access starts immediately, so head to setup.
    if (data.session) {
      navigate('/setup')
      return
    }
    setNeedsEmailConfirm(true)
  }

  if (needsEmailConfirm) {
    return (
      <AuthShell>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💌</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Almost there!</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
            We sent a confirmation link to <strong>{email}</strong>. Confirm your email, then log in to start your 30-day free trial — full access right away, no purchase needed yet.
          </p>
          <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: 18, textDecoration: 'none' }}>
            Go to login
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <h2 style={{ fontSize: 20, marginBottom: 18 }}>Create your account</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginTop: -8, marginBottom: 14 }}>{error}</p>}
        <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--ink-soft)' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  )
}
