import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import SleepWidget from '../components/SleepWidget'

export default function SleepTracker() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadLogs() {
    setLoading(true)
    const { data } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(60)
    setLogs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (user) loadLogs()
  }, [user])

  async function deleteLog(id) {
    await supabase.from('sleep_logs').delete().eq('id', id)
    loadLogs()
  }

  return (
    <PageShell title="Sleep Tracker">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Sleep Tracker</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        Log your sleep and wake times each day to see your average and how you're trending.
      </p>

      <div className="card" style={{ marginBottom: 20, background: 'var(--teal-100)', border: 'none' }}>
        <SleepWidget onLogged={loadLogs} />
      </div>

      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Your logs</h3>
      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : logs.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No sleep logged yet — start with tonight above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map((log) => (
            <div
              key={log.id}
              className="card"
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'none', border: '1px solid var(--teal-100)' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{log.duration_hours}h</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                  {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' · '}{log.sleep_time.slice(0, 5)} → {log.wake_time.slice(0, 5)}
                </div>
              </div>
              <button className="btn-ghost" onClick={() => deleteLog(log.id)} style={{ fontSize: 12 }}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
