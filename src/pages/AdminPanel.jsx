import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import { daysLeftInTrial } from '../access'
import { DATA_CATEGORIES } from '../dataCategories'

function StatusPill({ status }) {
  const map = {
    pending_payment: { bg: 'var(--pink-100)', color: 'var(--pink-700)', label: 'Pending' },
    trial: { bg: '#FFF3D6', color: '#946200', label: 'Trial' },
    active: { bg: 'var(--teal-100)', color: 'var(--teal-700)', label: 'Active' },
    suspended: { bg: '#F0E6E6', color: '#8A5A5A', label: 'Suspended' },
  }
  const s = map[status] || map.pending_payment
  return <span className="pill" style={{ background: s.bg, color: s.color }}>{s.label}</span>
}

function firstNameOf(fullName) {
  if (!fullName) return null
  return fullName.trim().split(/\s+/)[0]
}

function messageUserAboutUsage(u) {
  const firstName = firstNameOf(u.name) || 'there'
  const subject = 'My Purrsonal Planner — please free up some space'
  const body = [
    `Hi ${firstName},`,
    '',
    "Your account is using a good chunk of data storage in My Purrsonal Planner. To keep things running smoothly, could you take a few minutes to clear out some old entries you no longer need?",
    '',
    'Go to My Profile → Manage My Data, and choose which types of data to clear — you can pick and choose so nothing important gets deleted.',
    '',
    'Thanks so much!',
  ].join('\n')
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(u.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(url, '_blank')
}

function ProgressBar({ percent, color }) {
  return (
    <div style={{ height: 8, borderRadius: 8, background: 'var(--teal-100)', overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 8, width: `${Math.min(100, percent)}%`, background: color }} />
    </div>
  )
}

const FREE_TIER_DB_LIMIT_MB = 500
// Rough reference point for "a lot of rows" — not a real limit, just a
// stable yardstick so each user's bar means roughly the same thing over time.
const HEAVY_USER_ROW_REFERENCE = 500

export default function AdminPanel() {
  const { isAdmin, profile } = useAuth()
  const [tab, setTab] = useState('pending')
  const [users, setUsers] = useState([])
  const [dbSizeMb, setDbSizeMb] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteDrafts, setNoteDrafts] = useState({})
  const [pinResetFor, setPinResetFor] = useState(null)
  const [messagingUser, setMessagingUser] = useState(null)

  async function loadUsers() {
    setLoading(true)
    setError('')
    const [{ data, error }, { data: sizeBytes, error: sizeError }] = await Promise.all([
      supabase.rpc('admin_get_usage_stats'),
      supabase.rpc('admin_get_db_size_bytes'),
    ])
    if (error) setError(error.message)
    else if (sizeError) setError(sizeError.message)
    setUsers(data || [])
    if (typeof sizeBytes === 'number') setDbSizeMb(sizeBytes / (1024 * 1024))
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin])

  if (!isAdmin) return <Navigate to="/hub" replace />

  async function activate(userId) {
    const note = noteDrafts[userId] || null
    const { error } = await supabase.rpc('admin_activate_user', { p_user_id: userId, p_note: note })
    if (error) { setError(error.message); return }
    loadUsers()
  }

  async function suspend(userId) {
    const note = noteDrafts[userId] || null
    const { error } = await supabase.rpc('admin_suspend_user', { p_user_id: userId, p_note: note })
    if (error) { setError(error.message); return }
    loadUsers()
  }

  async function resetDiaryPin(userId) {
    const { error } = await supabase.rpc('admin_reset_diary_pin', { p_user_id: userId })
    if (error) { setError(error.message); return }
    setPinResetFor(userId)
  }

  const trial = users.filter((u) => u.account_status === 'trial')
  const pending = users.filter((u) => u.account_status === 'pending_payment')
  const active = users.filter((u) => u.account_status === 'active')
  const suspended = users.filter((u) => u.account_status === 'suspended')
  const shown = tab === 'trial' ? trial : tab === 'pending' ? pending : tab === 'active' ? active : tab === 'suspended' ? suspended : users

  return (
    <PageShell title="Admin">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Admin panel</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        The app is paid from day one: new signups land in Pending and see an activation screen. Press Activate once they've paid for the lifetime version. (Any older Trial accounts keep running until their trial ends.)
      </p>

      {dbSizeMb !== null && (
        <div className="card" style={{ marginBottom: 20, background: 'var(--teal-100)', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ fontWeight: 700 }}>Supabase free-tier database usage</span>
            <span>{dbSizeMb.toFixed(1)} MB / {FREE_TIER_DB_LIMIT_MB} MB</span>
          </div>
          <ProgressBar
            percent={(dbSizeMb / FREE_TIER_DB_LIMIT_MB) * 100}
            color={dbSizeMb / FREE_TIER_DB_LIMIT_MB > 0.85 ? '#f87171' : dbSizeMb / FREE_TIER_DB_LIMIT_MB > 0.6 ? '#F2C14E' : 'var(--teal-500)'}
          />
          <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 6, marginBottom: 0 }}>
            Internal only — this is the real total database size across all users, so you can see how close the project is to Supabase's free 500 MB limit.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { key: 'pending', label: `Pending (${pending.length})` },
          { key: 'active', label: `Active (${active.length})` },
          ...(trial.length > 0 ? [{ key: 'trial', label: `Old trials (${trial.length})` }] : []),
          { key: 'suspended', label: `Suspended (${suspended.length})` },
          { key: 'all', label: `All (${users.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={tab === t.key ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '7px 14px', fontSize: 13 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--ink-soft)' }}>Loading users…</p>
      ) : shown.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)' }}>No users in this view.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shown.map((u) => {
            const daysLeft = u.account_status === 'trial' ? daysLeftInTrial({ trial_ends_at: u.trial_ends_at }) : null
            const trialExpired = daysLeft === 0 && u.trial_ends_at && new Date(u.trial_ends_at) < new Date()
            return (
              <div key={u.user_id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{u.name || '(no name yet)'}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{u.email}</div>
                  </div>
                  <StatusPill status={u.account_status} />
                </div>
                <div style={{ display: 'flex', gap: 18, fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10, flexWrap: 'wrap' }}>
                  <span>Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span>
                  {u.activated_at && <span>Activated {new Date(u.activated_at).toLocaleDateString()}</span>}
                  {u.account_status === 'trial' && u.trial_ends_at && (
                    <span style={{ color: trialExpired ? '#c0392b' : 'var(--ink-soft)', fontWeight: trialExpired ? 700 : 400 }}>
                      {trialExpired ? 'Trial expired (now locked)' : `Trial ends ${new Date(u.trial_ends_at).toLocaleDateString()} (${daysLeft}d left)`}
                    </span>
                  )}
                  <span>Calendar events: {u.event_count}</span>
                  <span>To-dos: {u.todo_count}</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink-soft)', marginBottom: 4 }}>
                    <span>Data usage (rows across the app, rough estimate)</span>
                    <span>{u.total_rows}</span>
                  </div>
                  <ProgressBar percent={(u.total_rows / HEAVY_USER_ROW_REFERENCE) * 100} color="var(--teal-500)" />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    placeholder="Note (optional, e.g. payment ref)"
                    value={noteDrafts[u.user_id] ?? u.admin_note ?? ''}
                    onChange={(e) => setNoteDrafts((d) => ({ ...d, [u.user_id]: e.target.value }))}
                    style={{ flex: 1, minWidth: 160, padding: '8px 12px', borderRadius: 10, border: '2px solid var(--teal-100)', fontSize: 13 }}
                  />
                  {u.account_status !== 'active' && (
                    <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => activate(u.user_id)}>
                      Activate (lifetime)
                    </button>
                  )}
                  {u.account_status !== 'suspended' && (
                    <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => suspend(u.user_id)}>
                      Suspend
                    </button>
                  )}
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => messageUserAboutUsage(u)}>
                    ✉ Message about data usage
                  </button>
                  <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => resetDiaryPin(u.user_id)}>
                    Reset diary PIN → 0000
                  </button>
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setMessagingUser(u)}>
                    Message about data usage
                  </button>
                </div>
                {pinResetFor === u.user_id && (
                  <p style={{ fontSize: 12, color: 'var(--teal-700)', marginTop: 8 }}>
                    Diary PIN reset to 0000 — let them know so they can log in and set a new one.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {messagingUser && (
        <MessageModal user={messagingUser} onClose={() => setMessagingUser(null)} />
      )}
    </PageShell>
  )
}

function MessageModal({ user, onClose }) {
  const [selected, setSelected] = useState(new Set())
  const [note, setNote] = useState('')

  function toggle(key) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function sendEmail() {
    const categoryLines = DATA_CATEGORIES.filter((c) => selected.has(c.key)).map((c) => `- ${c.label}`)
    const subject = 'A quick note about your My Purrsonal Planner data'
    const bodyParts = [
      `Hi${user.name ? ' ' + user.name : ''},`,
      '',
      "Your account's data usage is getting up there, so it'd help a lot if you could clear out anything you don't need anymore.",
    ]
    if (categoryLines.length > 0) {
      bodyParts.push('', "A few categories that might be worth clearing:", ...categoryLines)
    }
    bodyParts.push(
      '',
      'You can do this yourself anytime — just go to My Profile → "Manage my data" in the app. You get to pick exactly what to clear, so anything important stays put.',
    )
    if (note.trim()) bodyParts.push('', note.trim())
    bodyParts.push('', 'Thanks!')

    const mailto = `mailto:${encodeURIComponent(user.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyParts.join('\n'))}`
    window.location.href = mailto
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20, overflowY: 'auto' }}
    >
      <div className="card" style={{ maxWidth: 440, width: '100%', margin: '20px 0' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 17, marginBottom: 4 }}>Message {user.name || user.email}</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>
          This opens your email app with a message pre-filled — nothing sends automatically. Check the categories
          you think are worth suggesting (this is just a suggestion in the email; they'll still choose for
          themselves in the app).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14, maxHeight: 240, overflowY: 'auto' }}>
          {DATA_CATEGORIES.map((cat) => (
            <label key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, cursor: 'pointer' }}>
              <input type="checkbox" checked={selected.has(cat.key)} onChange={() => toggle(cat.key)} />
              {cat.label}
            </label>
          ))}
        </div>
        <div className="field">
          <label htmlFor="msgNote">Add a personal note (optional)</label>
          <textarea
            id="msgNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '2px solid var(--teal-100)', fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={sendEmail}>Open email</button>
        </div>
      </div>
    </div>
  )
}
