import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const iso = (d) => d.toLocaleDateString('en-CA')
const pretty = (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const r1 = (n) => Math.round(n * 10) / 10

function Trend({ points }) {
  if (points.length < 2) return null
  const W = 300, H = 90, P = 8
  const ws = points.map((p) => Number(p.weight_kg))
  const min = Math.min(...ws), max = Math.max(...ws)
  const span = Math.max(max - min, 0.5)
  const xy = ws.map((w, i) => [P + (i / (ws.length - 1)) * (W - 2 * P), H - P - ((w - min) / span) * (H - 2 * P)])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 90 }} role="img" aria-label="Weight trend">
      <polyline points={xy.map((p) => p.join(',')).join(' ')} fill="none" stroke="var(--teal-500)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {xy.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="var(--pink-500)" />)}
    </svg>
  )
}

export default function FitnessWeight({ profile, onProfileChanged }) {
  const { user } = useAuth()
  const today = iso(new Date())
  const [logs, setLogs] = useState([])    // oldest -> newest
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(today)
  const [kg, setKg] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const { data, error } = await supabase
      .from('weight_logs').select('*').eq('user_id', user.id)
      .order('log_date', { ascending: true }).limit(730)
    if (error) setError(error.message)
    setLogs(data || [])
    setLoading(false)
  }
  useEffect(() => { if (user) load() }, [user])

  const target = profile.target_weight_kg ? Number(profile.target_weight_kg) : null
  const latest = logs.length ? Number(logs[logs.length - 1].weight_kg) : Number(profile.weight_kg)
  const start = Number(profile.start_weight_kg ?? (logs.length ? logs[0].weight_kg : profile.weight_kg))
  const hasGoal = target != null && Math.abs(start - target) >= 0.1
  const percent = hasGoal ? Math.max(0, Math.min(1, (start - latest) / (start - target))) * 100 : 0
  const losing = hasGoal && target < start
  const remaining = hasGoal ? Math.abs(latest - target) : 0
  const reached = hasGoal && (losing ? latest <= target : latest >= target)
  const wrongWay = hasGoal && !reached && (losing ? latest > start : latest < start)

  async function save(e) {
    e.preventDefault()
    const value = parseFloat(kg)
    if (!value) return
    setSaving(true); setError('')
    const patch = {}
    if (profile.start_weight_kg == null) patch.start_weight_kg = Number(profile.weight_kg)
    const isNewest = !logs.length || date >= logs[logs.length - 1].log_date
    if (isNewest) patch.weight_kg = value
    const { error } = await supabase.from('weight_logs').upsert(
      { user_id: user.id, log_date: date, weight_kg: value }, { onConflict: 'user_id,log_date' })
    if (error) { setSaving(false); setError(error.message); return }
    if (Object.keys(patch).length) await supabase.from('profiles').update(patch).eq('id', user.id)
    setSaving(false)
    setKg('')
    await load()
    onProfileChanged()
  }

  async function remove(log) {
    await supabase.from('weight_logs').delete().eq('id', log.id)
    const rest = logs.filter((l) => l.id !== log.id)
    if (rest.length && log.id === logs[logs.length - 1].id) {
      await supabase.from('profiles').update({ weight_kg: rest[rest.length - 1].weight_kg }).eq('id', user.id)
      onProfileChanged()
    }
    load()
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="card" style={{ marginBottom: 16, background: 'var(--pink-100)', border: 'none' }}>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>Weight progress</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', marginBottom: 12 }}>
          <div><div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Start</div><div style={{ fontSize: 18, fontWeight: 900 }}>{r1(start)} kg</div></div>
          <div><div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Now</div><div style={{ fontSize: 18, fontWeight: 900, color: 'var(--pink-700)' }}>{r1(latest)} kg</div></div>
          <div><div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Target</div><div style={{ fontSize: 18, fontWeight: 900, color: 'var(--teal-700)' }}>{target ? `${r1(target)} kg` : '—'}</div></div>
        </div>
        {hasGoal ? (
          <>
            <div style={{ height: 16, borderRadius: 16, background: 'white', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${percent}%`, borderRadius: 16, background: 'linear-gradient(90deg, var(--pink-500), var(--teal-500))', transition: 'width .4s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginTop: 6 }}>
              <span style={{ fontWeight: 800 }}>{Math.round(percent)}% of the way</span>
              <span style={{ color: 'var(--ink-soft)' }}>{reached ? 'Goal reached! 🎉' : `${r1(remaining)} kg to ${losing ? 'lose' : 'gain'}`}</span>
            </div>
            {wrongWay && <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6, marginBottom: 0 }}>You're a little off your starting point — that's okay, weight moves up and down. Keep logging.</p>}
          </>
        ) : (
          <p style={{ fontSize: 13, margin: 0 }}>You're set to maintain your weight. Log it regularly to keep an eye on it. (Change your goal under “Edit settings” on the Overview tab.)</p>
        )}
      </div>

      {/* Add weight */}
      <form className="card" onSubmit={save} style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>Log your weight</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="wdate">Date</label>
            <input id="wdate" type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="wkg">Weight (kg)</label>
            <input id="wkg" type="number" step="0.1" min="20" max="400" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} required />
          </div>
        </div>
        {error && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 8 }}>{error}</p>}
        <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={saving}>{saving ? 'Saving…' : 'Save weight'}</button>
        <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', margin: '8px 0 0' }}>One entry per day — saving the same date again updates it. Your latest weight also updates your BMI and calorie numbers.</p>
      </form>

      {/* Trend + history */}
      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 6 }}>History</h3>
        <Trend points={logs.slice(-30)} />
        {loading ? <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Loading…</p> : logs.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>No weigh-ins yet — log your first one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 6 }}>
            {[...logs].reverse().map((l, idx, arr) => {
              const prev = arr[idx + 1]
              const diff = prev ? Number(l.weight_kg) - Number(prev.weight_kg) : null
              const good = diff == null || Math.abs(diff) < 0.05 ? null : (losing ? diff < 0 : diff > 0)
              return (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px dashed var(--teal-100)', fontSize: 13.5 }}>
                  <span style={{ flex: 1 }}>{pretty(l.log_date)}</span>
                  {diff != null && Math.abs(diff) >= 0.05 && (
                    <span style={{ fontSize: 12, color: hasGoal ? (good ? 'var(--teal-700)' : 'var(--ink-soft)') : 'var(--ink-soft)' }}>{diff > 0 ? '▲' : '▼'} {r1(Math.abs(diff))}</span>
                  )}
                  <span style={{ fontWeight: 800 }}>{r1(Number(l.weight_kg))} kg</span>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '2px 6px' }} onClick={() => remove(l)} aria-label="Remove">✕</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
