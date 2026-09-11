import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'

function StatusPill({ status }) {
  const map = {
    pending_payment: { bg: 'var(--pink-100)', color: 'var(--pink-700)', label: 'Pending' },
    active: { bg: 'var(--teal-100)', color: 'var(--teal-700)', label: 'Active' },
    suspended: { bg: '#F0E6E6', color: '#8A5A5A', label: 'Suspended' },
  }
  const s = map[status] || map.pending_payment
  return <span className="pill" style={{ background: s.bg, color: s.color }}>{s.label}</span>
}

export default function AdminPanel() {
  const { isAdmin, profile } = useAuth()
  const [tab, setTab] = useState('pending')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteDrafts, setNoteDrafts] = useState({})

  async function loadUsers() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.rpc('admin_get_usage_stats')
    if (error) setError(error.message)
    setUsers(data || [])
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

  const pending = users.filter((u) => u.account_status === 'pending_payment')
  const active = users.filter((u) => u.account_status === 'active')
  const suspended = users.filter((u) => u.account_status === 'suspended')
  const shown = tab === 'pending' ? pending : tab === 'active' ? active : tab === 'suspended' ? suspended : users

  return (
    <PageShell title="Admin">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Admin panel</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        Confirm payments to activate access, and keep an eye on usage.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { key: 'pending', label: `Pending (${pending.length})` },
          { key: 'active', label: `Active (${active.length})` },
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
          {shown.map((u) => (
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
                <span>Calendar events: {u.event_count}</span>
                <span>To-dos: {u.todo_count}</span>
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
                    Activate
                  </button>
                )}
                {u.account_status !== 'suspended' && (
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => suspend(u.user_id)}>
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
