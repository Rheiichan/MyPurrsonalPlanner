import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthShell from '../components/AuthShell'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const [email, setEmail] = useState(undefined) // undefined = checking, null = invalid
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) { setEmail(null); return }
    supabase.rpc('get_reset_token_email', { p_token: token }).then(({ data, error }) => {
      setEmail(error || !data ? null : data)
    })
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError("Passwords don't match")
    setSaving(true)
    const { error } = await supabase.rpc('reset_password_with_token', { p_token: token, p_password: password })
    setSaving(false)
    if (error) return setError(error.message)
    setDone(true)
    setTimeout(() => navigate('/login', { replace: true }), 2500)
  }

  return (
    <AuthShell>
      <h2 style={{ fontSize: 20, marginBottom: 14 }}>Create a new password</h2>
      {done ? (
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
          Your password has been updated! Taking you to the log in page…
        </p>
      ) : email === undefined ? (
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Checking your link…</p>
      ) : email === null ? (
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
          This reset link is invalid, already used, or has expired. <Link to="/forgot-password">Request a new one</Link>.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Account email</label>
            <input type="email" value={email} readOnly style={{ background: 'var(--teal-100)' }} />
          </div>
          <div className="field">
            <label htmlFor="np">Create new password</label>
            <input id="np" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div className="field">
            <label htmlFor="cp">Confirm new password</label>
            <input id="cp" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginTop: -8, marginBottom: 14 }}>{error}</p>}
          <button className="btn-primary" style={{ width: '100%' }} disabled={saving}>
            {saving ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
