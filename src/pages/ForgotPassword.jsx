import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { SUPPORT_EMAIL } from '../pricing'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const valid = /^\S+@\S+\.\S+$/.test(email.trim())

  const subject = 'Password reset request - My Purrsonal Planner'
  const body = [
    'Hi!',
    '',
    'I forgot my password and would like to request a password reset for My Purrsonal Planner.',
    '',
    `Registered email: ${email.trim()}`,
    '',
    'I confirm that I have access to this email address.',
    '',
    'Thank you!',
  ].join('\n')
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return (
    <AuthShell>
      <h2 style={{ fontSize: 20, marginBottom: 10 }}>Forgot your password?</h2>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: 16 }}>
        Enter your <strong>registered email address</strong>. Make sure you still have access to it, because we'll send your reset link there.
      </p>
      <div className="field">
        <label htmlFor="email">Registered email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      {valid && (
        <a href={mailto} className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          Email us to request a password reset
        </a>
      )}
      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.5 }}>
        This opens your email app with a message to {SUPPORT_EMAIL}. Just press send, and we'll reply with a reset link.
      </p>
      <div style={{ marginTop: 18, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--pink-100)', fontSize: 13, lineHeight: 1.5 }}>
        <strong>No access to your registered email?</strong> You can <Link to="/signup">create a new account</Link> instead, but your old data can't be recovered.
      </div>
      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14 }}>
        <Link to="/login">Back to log in</Link>
      </p>
    </AuthShell>
  )
}
