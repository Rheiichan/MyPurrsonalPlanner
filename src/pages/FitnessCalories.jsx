import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const MEALS = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
]
// General guidance ceilings (WHO-style), only used if the person logs sodium/sugar.
const SODIUM_LIMIT_MG = 2000
const SUGAR_LIMIT_G = 50

const iso = (d) => d.toLocaleDateString('en-CA')
const shift = (dateStr, days) => { const d = new Date(dateStr + 'T00:00:00'); d.setDate(d.getDate() + days); return iso(d) }
const pretty = (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

function Bar({ percent, over }) {
  return (
    <div style={{ height: 12, borderRadius: 12, background: 'var(--teal-100)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, percent)}%`, borderRadius: 12, background: over ? '#f87171' : 'var(--teal-500)', transition: 'width .3s' }} />
    </div>
  )
}

export default function FitnessCalories({ goalCals }) {
  const { user } = useAuth()
  const today = iso(new Date())
  const [date, setDate] = useState(today)
  const [logs, setLogs] = useState([])      // last 14 days of entries
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [meal, setMeal] = useState('breakfast')
  const [name, setName] = useState('')
  const [cals, setCals] = useState('')
  const [showExtra, setShowExtra] = useState(false)
  const [sodium, setSodium] = useState('')
  const [sugar, setSugar] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const from = shift(today, -13)
    const { data, error } = await supabase
      .from('food_logs').select('*').eq('user_id', user.id)
      .gte('log_date', from).order('created_at', { ascending: true })
    if (error) setError(error.message)
    setLogs(data || [])
    setLoading(false)
  }
  useEffect(() => { if (user) load() }, [user])

  async function addEntry(e) {
    e.preventDefault()
    if (!name.trim() || cals === '') return
    setSaving(true); setError('')
    const { error } = await supabase.from('food_logs').insert({
      user_id: user.id, log_date: date, meal, name: name.trim(), calories: Math.round(parseFloat(cals)),
      sodium_mg: sodium === '' ? null : Math.round(parseFloat(sodium)),
      sugar_g: sugar === '' ? null : parseFloat(sugar),
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    setName(''); setCals(''); setSodium(''); setSugar('')
    load()
  }

  async function remove(id) {
    await supabase.from('food_logs').delete().eq('id', id)
    load()
  }

  const dayLogs = logs.filter((l) => l.log_date === date)
  const total = dayLogs.reduce((s, l) => s + l.calories, 0)
  const remaining = goalCals - total
  const over = remaining < 0
  const sodiumTotal = dayLogs.reduce((s, l) => s + (l.sodium_mg || 0), 0)
  const sugarTotal = dayLogs.reduce((s, l) => s + Number(l.sugar_g || 0), 0)
  const hasExtra = dayLogs.some((l) => l.sodium_mg != null || l.sugar_g != null)

  const history = Array.from({ length: 14 }, (_, i) => shift(today, -i)).map((d) => ({
    date: d, total: logs.filter((l) => l.log_date === d).reduce((s, l) => s + l.calories, 0),
    count: logs.filter((l) => l.log_date === d).length,
  }))

  return (
    <div>
      {/* Date switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
        <button className="btn-ghost" onClick={() => setDate(shift(date, -1))} aria-label="Previous day">◀</button>
        <div style={{ fontWeight: 800, minWidth: 150, textAlign: 'center' }}>{date === today ? 'Today' : pretty(date)}</div>
        <button className="btn-ghost" onClick={() => setDate(shift(date, 1))} disabled={date >= today} aria-label="Next day">▶</button>
      </div>

      {/* Daily summary */}
      <div className="card" style={{ marginBottom: 16, background: over ? '#fff1f0' : 'var(--teal-100)', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div><span style={{ fontSize: 28, fontWeight: 900, color: over ? '#c0392b' : 'var(--ink)' }}>{total}</span> <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>/ {goalCals} kcal</span></div>
          <div style={{ fontSize: 13, fontWeight: 800, color: over ? '#c0392b' : 'var(--teal-700)' }}>
            {over ? `${Math.abs(remaining)} kcal over` : `${remaining} kcal left`}
          </div>
        </div>
        <Bar percent={(total / goalCals) * 100} over={over} />
        <p style={{ fontSize: 12.5, marginTop: 8, marginBottom: 0, color: over ? '#c0392b' : 'var(--ink-soft)' }}>
          {over ? "You've gone over today's calorie goal — no stress, just balance it out tomorrow." : total === 0 ? 'Nothing logged yet — add what you eat below.' : "You're within your goal. Nice!"}
        </p>
        {hasExtra && (
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12, marginTop: 10, color: 'var(--ink-soft)' }}>
            <span style={{ color: sodiumTotal > SODIUM_LIMIT_MG ? '#c0392b' : undefined }}>Sodium: <strong>{sodiumTotal} mg</strong> / ~{SODIUM_LIMIT_MG}</span>
            <span style={{ color: sugarTotal > SUGAR_LIMIT_G ? '#c0392b' : undefined }}>Sugar: <strong>{Math.round(sugarTotal * 10) / 10} g</strong> / ~{SUGAR_LIMIT_G}</span>
          </div>
        )}
      </div>

      {/* Add form */}
      <form className="card" onSubmit={addEntry} style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>Add food</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="meal">Meal</label>
            <select id="meal" value={meal} onChange={(e) => setMeal(e.target.value)}>
              {MEALS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div className="field" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label htmlFor="food">What did you eat?</label>
            <input id="food" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken adobo + rice" required />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="cal">Calories (kcal)</label>
            <input id="cal" type="number" min="0" max="10000" inputMode="numeric" value={cals} onChange={(e) => setCals(e.target.value)} required />
          </div>
        </div>
        <button type="button" className="btn-ghost" style={{ fontSize: 12.5, marginTop: 8 }} onClick={() => setShowExtra(!showExtra)}>
          {showExtra ? '− Hide' : '+ Add'} sodium & sugar (optional)
        </button>
        {showExtra && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="na">Sodium (mg)</label>
              <input id="na" type="number" min="0" inputMode="numeric" value={sodium} onChange={(e) => setSodium(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="sug">Sugar (g)</label>
              <input id="sug" type="number" min="0" step="0.1" inputMode="decimal" value={sugar} onChange={(e) => setSugar(e.target.value)} />
            </div>
          </div>
        )}
        {error && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 8 }}>{error}</p>}
        <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={saving}>{saving ? 'Adding…' : 'Add to log'}</button>
      </form>

      {/* Entries for the day */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>{date === today ? "Today's log" : `Log for ${pretty(date)}`}</h3>
        {loading ? <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Loading…</p> : dayLogs.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>No food logged for this day.</p>
        ) : MEALS.map((m) => {
          const items = dayLogs.filter((l) => l.meal === m.key)
          if (items.length === 0) return null
          return (
            <div key={m.key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: 'var(--teal-700)', marginBottom: 4 }}>
                <span>{m.label}</span><span>{items.reduce((s, l) => s + l.calories, 0)} kcal</span>
              </div>
              {items.map((l) => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, padding: '4px 0', borderBottom: '1px dashed var(--teal-100)' }}>
                  <span style={{ flex: 1 }}>{l.name}{(l.sodium_mg != null || l.sugar_g != null) && (
                    <span style={{ color: 'var(--ink-soft)', fontSize: 11.5 }}> · {l.sodium_mg != null ? `${l.sodium_mg}mg Na` : ''}{l.sodium_mg != null && l.sugar_g != null ? ' · ' : ''}{l.sugar_g != null ? `${l.sugar_g}g sugar` : ''}</span>
                  )}</span>
                  <span style={{ fontWeight: 700 }}>{l.calories}</span>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '2px 6px' }} onClick={() => remove(l.id)} aria-label="Remove">✕</button>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* 14-day history */}
      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>Last 14 days</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.map((h) => {
            const o = h.total > goalCals
            return (
              <button key={h.date} onClick={() => setDate(h.date)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 3 }}>
                  <span style={{ fontWeight: h.date === date ? 800 : 500 }}>{h.date === today ? 'Today' : pretty(h.date)}</span>
                  <span style={{ color: o ? '#c0392b' : 'var(--ink-soft)', fontWeight: o ? 800 : 500 }}>
                    {h.count === 0 ? '—' : `${h.total} / ${goalCals} kcal${o ? ` · over by ${h.total - goalCals}` : ''}`}
                  </span>
                </div>
                <Bar percent={h.count === 0 ? 0 : (h.total / goalCals) * 100} over={o} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
