import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import MoodWidget from '../components/MoodWidget'
import { IconMoodFace } from '../components/icons'
import { moodByLevel } from '../moods'

export default function MoodTracker() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadLogs() {
    setLoading(true)
    const { data } = await supabase
      .from('mood_logs')
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
    await supabase.from('mood_logs').delete().eq('id', id)
    loadLogs()
  }

  return (
    <PageShell title="Mood Tracker">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Mood Tracker</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        One check-in a day — a quick, honest read on how you're doing.
      </p>

      <div className="card" style={{ marginBottom: 20, background: 'var(--teal-100)', border: 'none' }} onClickCapture={() => setTimeout(loadLogs, 300)}>
        <MoodWidget />
      </div>

      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Your logs</h3>
      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : logs.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No moods logged yet — start with today above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map((log) => {
            const mood = moodByLevel(log.mood_level)
            return (
              <div
                key={log.id}
                className="card"
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'none', border: '1px solid var(--teal-100)' }}
              >
                <IconMoodFace level={log.mood_level} color={mood.color} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{mood.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <button className="btn-ghost" onClick={() => deleteLog(log.id)} style={{ fontSize: 12 }}>Remove</button>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
