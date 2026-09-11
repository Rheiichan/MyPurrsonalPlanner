import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { computeSleepHours, sleepFeedback, to12Hour } from '../sleep'
import { IconSleep } from './icons'
import TimeInput12 from './TimeInput12'

function todayISO() {
  return new Date().toLocaleDateString('en-CA')
}

function formatTime12(time24) {
  const { hour12, minute, meridiem } = to12Hour(time24)
  return `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`
}

export default function SleepWidget({ compact = false, onLogged }) {
  const { user } = useAuth()
  const [todayLog, setTodayLog] = useState(null)
  const [avgHours, setAvgHours] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [sleepTime, setSleepTime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data: today } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', todayISO())
      .maybeSingle()
    setTodayLog(today)
    if (today) {
      setSleepTime(today.sleep_time.slice(0, 5))
      setWakeTime(today.wake_time.slice(0, 5))
    }

    const { data: recent } = await supabase
      .from('sleep_logs')
      .select('duration_hours')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(7)
    if (recent && recent.length > 0) {
      const avg = recent.reduce((sum, r) => sum + Number(r.duration_hours), 0) / recent.length
      setAvgHours(Math.round(avg * 10) / 10)
    } else {
      setAvgHours(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user) load()
  }, [user])

  async function saveSleep(e) {
    e.preventDefault()
    setSaving(true)
    const duration = computeSleepHours(sleepTime, wakeTime)
    await supabase.from('sleep_logs').upsert(
      {
        user_id: user.id,
        log_date: todayISO(),
        sleep_time: sleepTime,
        wake_time: wakeTime,
        duration_hours: duration,
      },
      { onConflict: 'user_id,log_date' }
    )
    setSaving(false)
    setShowModal(false)
    await load()
    if (onLogged) onLogged()
  }

  const feedback = sleepFeedback(avgHours)

  return (
    <div>
      <h3 style={{ fontSize: compact ? 15 : 16, marginBottom: 10 }}>Sleep Tracker</h3>

      {!loading && todayLog && (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 10 }}>
          Last night: <strong style={{ color: 'var(--ink)' }}>{todayLog.duration_hours}h</strong>{' '}
          ({formatTime12(todayLog.sleep_time.slice(0, 5))} → {formatTime12(todayLog.wake_time.slice(0, 5))})
        </p>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="btn-secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, marginBottom: 12 }}
      >
        <IconSleep /> Log your Sleep
      </button>

      {avgHours != null && feedback && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: feedback.color, flexShrink: 0 }} />
          <span>
            <strong>{avgHours}h</strong> avg (7 days) — {feedback.message}
          </span>
        </div>
      )}
      {!loading && avgHours == null && (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Log tonight's sleep to start tracking your average.</p>
      )}

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20,
          }}
        >
          <div className="card" style={{ maxWidth: 340, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, marginBottom: 14 }}>Log your sleep</h3>
            <form onSubmit={saveSleep}>
              <div className="field">
                <label>What time did you sleep?</label>
                <TimeInput12 value={sleepTime} onChange={setSleepTime} />
              </div>
              <div className="field">
                <label>What time did you wake up?</label>
                <TimeInput12 value={wakeTime} onChange={setWakeTime} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: -6, marginBottom: 16 }}>
                That's about <strong>{computeSleepHours(sleepTime, wakeTime)}h</strong> of sleep.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
