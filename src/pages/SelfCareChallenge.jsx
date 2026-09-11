import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import { CHALLENGE_DAYS, CHALLENGE_COLORS, currentYearMonth, formatYearMonth } from '../selfcare'

export default function SelfCareChallenge() {
  const { user } = useAuth()
  const thisMonth = currentYearMonth()
  const [doneDays, setDoneDays] = useState(new Set())
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('selfcare_logs')
      .select('year_month, day_number')
      .eq('user_id', user.id)

    const currentDone = new Set()
    const byMonth = {}
    for (const row of data || []) {
      if (row.year_month === thisMonth) {
        currentDone.add(row.day_number)
      } else {
        byMonth[row.year_month] = (byMonth[row.year_month] || 0) + 1
      }
    }
    setDoneDays(currentDone)
    setHistory(
      Object.entries(byMonth)
        .map(([ym, count]) => ({ ym, count }))
        .sort((a, b) => (a.ym < b.ym ? 1 : -1))
    )
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  async function toggleDay(dayNumber) {
    const isDone = doneDays.has(dayNumber)
    if (isDone) {
      await supabase
        .from('selfcare_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('year_month', thisMonth)
        .eq('day_number', dayNumber)
    } else {
      await supabase
        .from('selfcare_logs')
        .insert({ user_id: user.id, year_month: thisMonth, day_number: dayNumber })
    }
    setDoneDays((prev) => {
      const next = new Set(prev)
      if (isDone) next.delete(dayNumber)
      else next.add(dayNumber)
      return next
    })
  }

  return (
    <PageShell title="Self-Care Challenge">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>30-Day Self-Care Challenge</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 6 }}>
        {formatYearMonth(thisMonth)} — check off a day as you complete it. Resets fresh at the start of each month.
      </p>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--teal-700)', marginBottom: 20 }}>
        {doneDays.size}/30 completed this month
      </p>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 10, marginBottom: 30,
          }}
        >
          {CHALLENGE_DAYS.map((task, i) => {
            const dayNumber = i + 1
            const isDone = doneDays.has(dayNumber)
            return (
              <button
                key={dayNumber}
                onClick={() => toggleDay(dayNumber)}
                style={{
                  textAlign: 'left', border: 'none', borderRadius: 14, padding: 14,
                  background: CHALLENGE_COLORS[i % CHALLENGE_COLORS.length],
                  opacity: isDone ? 0.55 : 1, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 8, minHeight: 90,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 20, height: 20, borderRadius: 6, background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900,
                    color: 'var(--teal-700)',
                  }}
                >
                  {isDone ? '✓' : ''}
                </span>
                <span
                  style={{
                    fontSize: 12.5, fontWeight: 700, color: 'var(--ink)',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}
                >
                  {task}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Previous months</h3>
      {history.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No past months yet — this'll fill in once a new month starts.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.map((h) => (
            <div
              key={h.ym}
              className="card"
              style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'none', border: '1px solid var(--teal-100)' }}
            >
              <span style={{ fontSize: 14, fontWeight: 700 }}>{formatYearMonth(h.ym)}</span>
              <span style={{ fontSize: 14, color: 'var(--teal-700)', fontWeight: 700 }}>{h.count}/30 completed</span>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
