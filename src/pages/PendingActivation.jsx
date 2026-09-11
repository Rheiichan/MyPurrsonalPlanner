import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'

export default function PendingActivation() {
  const { profile, signOut } = useAuth()
  const suspended = profile?.account_status === 'suspended'

  return (
    <AuthShell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{suspended ? '⏸️' : '💌'}</div>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>
          {suspended ? 'Your access is paused' : 'Almost there!'}
        </h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
          {suspended
            ? "Your planner access has been paused. If you think this is a mistake, please reach out so we can sort it out."
            : "Your account is created — we just need to confirm your purchase before opening up your planner. This is usually done within a day."}
        </p>
        {profile?.admin_note && (
          <p style={{ fontSize: 13, color: 'var(--pink-700)', marginTop: 10 }}>{profile.admin_note}</p>
        )}
        <button className="btn-secondary" style={{ marginTop: 18 }} onClick={signOut}>
          Sign out
        </button>
      </div>
    </AuthShell>
  )
}
