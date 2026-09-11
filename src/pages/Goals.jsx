import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'

export default function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('is_done', { ascending: true })
      .order('created_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (user) load()
  }, [user])

  async function addGoal(e) {
    e.preventDefault()
    if (!title.trim()) return
    await supabase.from('goals').insert({
      user_id: user.id,
      title: title.trim(),
      target_date: targetDate || null,
    })
    setTitle('')
    setTargetDate('')
    load()
  }

  async function toggleDone(g) {
    await supabase.from('goals').update({ is_done: !g.is_done }).eq('id', g.id)
    load()
  }

  async function remove(id) {
    await supabase.from('goals').delete().eq('id', id)
    load()
  }

  return (
    <PageShell title="Goals">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Goals</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        A place to plan for the future — big or small.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={addGoal} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to achieve?"
            style={{ flex: 1, minWidth: 180, padding: '10px 12px', borderRadius: 10, border: '2px solid var(--teal-100)' }}
          />
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 10, border: '2px solid var(--teal-100)' }}
          />
          <button className="btn-primary">Add goal</button>
        </form>
      </div>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : goals.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No goals yet — add your first one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {goals.map((g) => (
            <div
              key={g.id}
              className="card"
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'none', border: '1px solid var(--teal-100)' }}
            >
              <input type="checkbox" checked={g.is_done} onChange={() => toggleDone(g)} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, textDecoration: g.is_done ? 'line-through' : 'none', color: g.is_done ? 'var(--ink-soft)' : 'var(--ink)' }}>
                  {g.title}
                </div>
                {g.target_date && (
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    Target: {new Date(g.target_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
              <button className="btn-ghost" onClick={() => remove(g.id)} style={{ fontSize: 12 }}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
