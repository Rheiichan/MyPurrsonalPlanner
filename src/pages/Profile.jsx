import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'

const DATA_TABLES = [
  'calendar_events', 'daily_todos', 'mood_logs', 'sleep_logs',
  'goals', 'gratitude_entries', 'achievements', 'diary_entries', 'selfcare_logs', 'user_recipes',
  'grocery_checks', 'grocery_custom_items', 'notebook_pages', 'notebooks',
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
        Permanently clears your calendar events, to-dos, mood and sleep logs, goals, gratitude entries, achievements, secret diary entries, self-care challenge progress, saved recipes, grocery list, and notebooks (notebooks will reset to 5 blank ones next time you open them). Your account, PIN, and profile details stay as they are.
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
