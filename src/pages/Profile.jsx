import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import { pushSupported, getCurrentSubscription, enablePushNotifications, disablePushNotifications } from '../push'
import { THEMES } from '../themes'

const DATA_TABLES = [
  'calendar_events', 'daily_todos', 'mood_logs', 'sleep_logs',
  'goals', 'gratitude_entries', 'achievements', 'diary_entries', 'selfcare_logs', 'user_recipes',
  'grocery_checks', 'grocery_custom_items', 'notebook_pages', 'notebooks',
  'project_items', 'projects', 'trip_itinerary_items', 'trip_packing_items', 'trips',
  'budget_incomes', 'budget_expenses', 'budget_savings', 'budget_allocations', 'quick_todos',
]

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()

  return (
    <PageShell title="My Profile">
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>My Profile</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 6 }}>Linked email</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{user?.email}</p>
      </div>

      <ProfileDetailsCard profile={profile} userId={user?.id} onSaved={refreshProfile} />
      <ThemeCard profile={profile} userId={user?.id} onSaved={refreshProfile} />
      <NotificationsCard userId={user?.id} />
      <PasswordCard />
      <DangerZoneCard userId={user?.id} />
    </PageShell>
  )
}

function ProfileDetailsCard({ profile, userId, onSaved }) {
  const [name, setName] = useState(profile?.name || '')
  const [birthday, setBirthday] = useState(profile?.birthday || '')
  const [height, setHeight] = useState(profile?.height_cm ?? '')
  const [weight, setWeight] = useState(profile?.weight_kg ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    const { error } = await supabase
      .from('profiles')
      .update({
        name: name || null,
        birthday: birthday || null,
        height_cm: height === '' ? null : parseFloat(height),
        weight_kg: weight === '' ? null : parseFloat(weight),
      })
      .eq('id', userId)
    setSaving(false)
    if (error) { setError(error.message); return }
    setSaved(true)
    onSaved()
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, marginBottom: 14 }}>Your details</h3>
      <form onSubmit={save}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="birthday">Birthday</label>
          <input id="birthday" type="date" value={birthday || ''} onChange={(e) => setBirthday(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="height">Height (cm)</label>
          <input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="weight">Weight (kg)</label>
          <input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {saved && <p style={{ color: 'var(--teal-700)', fontSize: 13, marginBottom: 12 }}>Saved!</p>}
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  )
}

function NotificationsCard({ userId }) {
  const [supported, setSupported] = useState(true)
  const [enabled, setEnabled] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setSupported(pushSupported())
    getCurrentSubscription().then((sub) => {
      setEnabled(!!sub)
      setChecking(false)
    }).catch(() => setChecking(false))
  }, [])

  async function toggle() {
    setLoading(true)
    setError('')
    try {
      if (enabled) {
        await disablePushNotifications()
        setEnabled(false)
      } else {
        await enablePushNotifications(userId)
        setEnabled(true)
      }
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, marginBottom: 6 }}>Notifications</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12 }}>
        Get reminders for your quick to-dos (6am, 12pm, 6pm if anything's still unchecked), calendar events
        (at their set time), a daily 6pm mood check-in nudge, and goal due dates.
      </p>
      {!supported ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Notifications aren't supported on this browser/device.</p>
      ) : checking ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Checking…</p>
      ) : (
        <>
          {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 10 }}>{error}</p>}
          <button className={enabled ? 'btn-secondary' : 'btn-primary'} onClick={toggle} disabled={loading}>
            {loading ? 'Working…' : enabled ? 'Turn off notifications' : 'Turn on notifications'}
          </button>
        </>
      )}
    </div>
  )
}

function ThemeCard({ profile, userId, onSaved }) {
  const current = profile?.theme || 'pink-teal'
  const [saving, setSaving] = useState(null)

  async function chooseTheme(key) {
    setSaving(key)
    await supabase.from('profiles').update({ theme: key }).eq('id', userId)
    setSaving(null)
    onSaved()
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, marginBottom: 6 }}>Theme</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>
        Pick a pastel color pair for the whole app.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {Object.entries(THEMES).map(([key, theme]) => {
          const isActive = current === key
          return (
            <button
              key={key}
              onClick={() => chooseTheme(key)}
              disabled={saving === key}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 12, border: isActive ? '2px solid var(--teal-500)' : '2px solid var(--teal-100)',
                background: isActive ? 'var(--teal-100)' : 'white', cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: theme.swatch[0], border: '2px solid white', boxShadow: '0 0 0 1px var(--teal-100)' }} />
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: theme.swatch[1], border: '2px solid white', boxShadow: '0 0 0 1px var(--teal-100)', marginLeft: -8 }} />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, textAlign: 'left' }}>
                {theme.label}{isActive ? ' ✓' : ''}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PasswordCard() {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault()
    setError('')
    setSaved(false)
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirm) {
      setError("Passwords don't match")
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (error) { setError(error.message); return }
    setNewPassword('')
    setConfirm('')
    setSaved(true)
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, marginBottom: 14 }}>Change password</h3>
      <form onSubmit={save}>
        <div className="field">
          <label htmlFor="newPassword">New password</label>
          <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input id="confirmPassword" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {saved && <p style={{ color: 'var(--teal-700)', fontSize: 13, marginBottom: 12 }}>Password updated!</p>}
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Update password'}</button>
      </form>
    </div>
  )
}

function DangerZoneCard({ userId }) {
  const [confirming, setConfirming] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [done, setDone] = useState(false)

  async function resetData() {
    setResetting(true)
    for (const table of DATA_TABLES) {
      await supabase.from(table).delete().eq('user_id', userId)
    }
    setResetting(false)
    setConfirming(false)
    setDone(true)
  }

  return (
    <div className="card" style={{ border: '1px solid var(--pink-300)' }}>
      <h3 style={{ fontSize: 15, marginBottom: 6, color: 'var(--pink-700)' }}>Danger zone</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>
        Permanently clears your calendar events, to-dos, quick to-do list, mood and sleep logs, goals, gratitude entries, achievements, secret diary entries, self-care challenge progress, saved recipes, grocery list, notebooks (notebooks will reset to 5 blank ones next time you open them), projects, trips, and budgeting data. Your account, PIN, and profile details stay as they are.
      </p>
      {!confirming ? (
        <button className="btn-secondary" onClick={() => setConfirming(true)}>Reset my data</button>
      ) : (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Are you sure? This can't be undone.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
            <button className="btn-primary" style={{ background: 'var(--pink-700)' }} onClick={resetData} disabled={resetting}>
              {resetting ? 'Resetting…' : 'Yes, reset everything'}
            </button>
          </div>
        </div>
      )}
      {done && <p style={{ color: 'var(--teal-700)', fontSize: 13, marginTop: 12 }}>Your data has been reset.</p>}
    </div>
  )
}
