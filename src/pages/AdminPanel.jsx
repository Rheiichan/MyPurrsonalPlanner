import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import { daysLeftInTrial } from '../access'
import { DATA_CATEGORIES } from '../dataCategories'
import { REGISTRATION_DAYS, PAYMENT_URL, CONTACT_URL, PRICE_NOW, CURRENCY } from '../pricing'

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
    'Go to My Profile and Settings → Manage My Data, and choose which types of data to clear — you can pick and choose so nothing important gets deleted.',
    '',
    'Thanks so much!',
  ].join('\n')
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(u.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(url, '_blank')
}

function openGmail(email, subject, body) {
  window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
}

// Time left in the payment window for an unpaid signup.
function registrationClock(u) {
  if (!u.created_at) return null
  const deadline = new Date(new Date(u.created_at).getTime() + REGISTRATION_DAYS * 86400000)
  const ms = deadline - new Date()
  const abs = Math.abs(ms)
  const d = Math.floor(abs / 86400000)
  const h = Math.floor((abs % 86400000) / 3600000)
  const text = d > 0 ? `${d}d ${h}h` : `${h}h ${Math.floor((abs % 3600000) / 60000)}m`
  return { deadline, overdue: ms < 0, text }
}

function emailPaymentReminder(u) {
  const c = registrationClock(u)
  openGmail(u.email, 'Your My Purrsonal Planner registration — payment reminder', [
    `Hi${u.name ? ' ' + u.name : ''},`,
    '',
    `Thanks for signing up for My Purrsonal Planner! Your spot is reserved, but your registration will be cancelled if payment isn't made within ${REGISTRATION_DAYS} days of signing up${c ? ` (by ${c.deadline.toLocaleDateString()})` : ''}.`,
    '',
    `The digital planner is on sale for ${CURRENCY}${PRICE_NOW}. You can pay here: ${PAYMENT_URL}`,
    `Please pay using this email (${u.email}) so we can match your payment.`,
    "Note: when you pay, the merchant name will show as 'Soaphrodite PH'. That's our sister brand, owned by the same family business as My Purrsonal Planner, so it's the right payment.",
    '',
    'Thank you!',
  ].join('\n'))
}

function emailPaymentConfirmation(u) {
  openGmail(u.email, 'Payment received — welcome to My Purrsonal Planner!', [
    `Hi${u.name ? ' ' + u.name : ''},`,
    '',
    'We have received your payment. Thank you so much for getting My Purrsonal Planner!',
    '',
    `Your account (${u.email}) is now active. If the app still shows the payment page, just refresh it (or close and reopen the app, then log in again) and all features will be unlocked.`,
    '',
    `Open the app here: ${window.location.origin}`,
    '',
    'HOW TO INSTALL IT AS AN APP',
    '',
    'Android (Chrome):',
    '1. Open the link above in Chrome and log in.',
    '2. Tap the 3-dot menu (top right).',
    '3. Tap "Install app" or "Add to Home screen", then tap Install.',
    '',
    'iPhone / iPad (Safari):',
    '1. Open the link above in Safari (it must be Safari).',
    '2. Tap the Share button (square with an arrow).',
    '3. Scroll down and tap "Add to Home Screen", then tap Add.',
    '',
    'PC / Laptop (Chrome or Edge):',
    '1. Open the link above and log in.',
    '2. Click the install icon at the right end of the address bar (a small screen with a down arrow), or open the browser menu and choose "Install My Purrsonal Planner" / "Cast, save and share > Install page as app".',
    '3. Click Install. The app will open in its own window and appear on your desktop or Start menu.',
    '',
    'Tip: you need internet to sync and save, but you can still open and view your planner offline.',
    '',
    'FEEDBACK & SUGGESTIONS',
    "We're open to feedback! If you run into a glitch or issue, or want to suggest a feature, just reply to this email" + (CONTACT_URL ? ` or message our page: ${CONTACT_URL}` : '') + '. Please include what you were doing and what device you use so we can fix it faster.',
    '',
    'Thank you and enjoy your planner!',
  ].join('\n'))
}

function emailResetLink(u, url) {
  openGmail(u.email, 'Reset your My Purrsonal Planner password', [
    `Hi${u.name ? ' ' + u.name : ''},`,
    '',
    'Here is your password reset link for My Purrsonal Planner:',
    url,
    '',
    'Open it, check that your email address is shown correctly, then create and confirm your new password. The link works once and expires in 24 hours.',
    '',
    'If you did not ask for this, you can ignore this email.',
    '',
    'Thank you!',
  ].join('\n'))
}

function emailCancellation(u) {
  openGmail(u.email, 'Your My Purrsonal Planner registration has been cancelled', [
    `Hi${u.name ? ' ' + u.name : ''},`,
    '',
    `Since we didn't receive payment within ${REGISTRATION_DAYS} days, your My Purrsonal Planner registration has been cancelled and your slot released.`,
    `If you'd still like the planner, you're welcome to sign up again while slots last: ${window.location.origin}`,
    '',
    'Thank you!',
  ].join('\n'))
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
  const [slots, setSlots] = useState(null)
  const [resetLink, setResetLink] = useState(null)
  const [copied, setCopied] = useState(false)
  const [, setTick] = useState(0)

  async function loadUsers() {
    setLoading(true)
    setError('')
    const [{ data, error }, { data: sizeBytes, error: sizeError }] = await Promise.all([
      supabase.rpc('admin_get_usage_stats'),
      supabase.rpc('admin_get_db_size_bytes'),
    ])
    supabase.rpc('get_slots_info').then(({ data: s }) => { const r = Array.isArray(s) ? s[0] : s; if (r) setSlots(r) })
    if (error) setError(error.message)
    else if (sizeError) setError(sizeError.message)
    setUsers(data || [])
    if (typeof sizeBytes === 'number') setDbSizeMb(sizeBytes / (1024 * 1024))
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin])

  // re-render every minute so the payment-window timers stay current
  useEffect(() => { const t = setInterval(() => setTick((n) => n + 1), 60000); return () => clearInterval(t) }, [])

  if (!isAdmin) return <Navigate to="/hub" replace />

  async function makeResetLink(u) {
    setError('')
    setCopied(false)
    const { data, error: err } = await supabase.rpc('admin_create_reset_token', { p_user_id: u.user_id })
    if (err) { setError(err.message); return }
    setResetLink({ user: u, url: `${window.location.origin}/reset-password?token=${data}` })
  }

  async function activate(userId) {
    const note = noteDrafts[userId] || null
    const { error } = await supabase.rpc('admin_activate_user', { p_user_id: userId, p_note: note })
    if (error) { setError(error.message); return }
    loadUsers()
  }

  async function deleteUnpaid(u) {
    if (!window.confirm(`Delete ${u.name || u.email} (${u.email}) permanently? This removes their account and cannot be undone.`)) return
    const { error } = await supabase.rpc('admin_delete_unpaid_user', { p_user_id: u.user_id })
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

      {slots && (
        <div className="card" style={{ marginBottom: 20, background: 'var(--pink-100)', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ fontWeight: 700 }}>Paid slots (active users)</span>
            <span>{slots.taken} / {slots.max_slots} taken · {slots.remaining} left</span>
          </div>
          <ProgressBar percent={(slots.taken / slots.max_slots) * 100} color={slots.remaining === 0 ? '#f87171' : 'var(--pink-500)'} />
          <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 6, marginBottom: 0 }}>
            Customers see the remaining slots on their purchase page. To change the limit, run in Supabase: update app_settings set value = '30' where key = 'max_active_users';
          </p>
        </div>
      )}

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

      {resetLink && (
        <div className="card" style={{ padding: 16, marginBottom: 14, border: '2px dashed var(--pink-500)' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Password reset link for {resetLink.user.email}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8 }}>Valid for 24 hours, works once. Send it only to this user.</div>
          <input readOnly value={resetLink.url} onFocus={(e) => e.target.select()} style={{ width: '100%', fontSize: 12, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={async () => { try { await navigator.clipboard.writeText(resetLink.url); setCopied(true) } catch { /* select + copy manually */ } }}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => emailResetLink(resetLink.user, resetLink.url)}>
              ✉ Email it to them
            </button>
            <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setResetLink(null)}>Close</button>
          </div>
        </div>
      )}

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
                  {u.account_status === 'pending_payment' && (() => {
                    const c = registrationClock(u)
                    return c && (
                      <span style={{ color: c.overdue ? '#c0392b' : '#946200', fontWeight: 700 }}>
                        {c.overdue ? `⏰ Payment overdue by ${c.text} — can be cancelled` : `⏳ Cancels in ${c.text}`}
                      </span>
                    )
                  })()}
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
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => makeResetLink(u)}>
                    🔑 Password reset link
                  </button>
                  {(u.account_status === 'active' || u.account_status === 'pending_payment') && (
                    <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => emailPaymentConfirmation(u)}>
                      ✉ Payment confirmation
                    </button>
                  )}
                  {u.account_status === 'pending_payment' && (
                    <>
                      <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => emailPaymentReminder(u)}>
                        ✉ Payment reminder
                      </button>
                      {registrationClock(u)?.overdue && (
                        <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => emailCancellation(u)}>
                          ✉ Cancellation notice
                        </button>
                      )}
                    </>
                  )}
                  {(u.account_status === 'pending_payment' || u.account_status === 'suspended') && (
                    <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13, color: '#c0392b', borderColor: '#f3b4ad' }} onClick={() => deleteUnpaid(u)}>
                      🗑 Delete user
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
      'You can do this yourself anytime — just go to My Profile and Settings → "Manage my data" in the app. You get to pick exactly what to clear, so anything important stays put.',
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
