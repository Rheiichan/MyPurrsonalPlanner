import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'

function NewProjectModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name: name.trim(), target_date: targetDate || null })
      .select()
      .maybeSingle()
    setSaving(false)
    if (error) { setError(error.message); return }
    onCreated(data)
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
    >
      <div className="card" style={{ maxWidth: 380, width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, marginBottom: 14 }}>New project</h3>
        <form onSubmit={save}>
          <div className="field">
            <label htmlFor="projectName">Project name</label>
            <input id="projectName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Backyard Garden Makeover" required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="targetDate">Target date (optional)</label>
            <input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Creating…' : 'Create project'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectPlanner() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [counts, setCounts] = useState({})

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setProjects(data || [])

    if (data && data.length > 0) {
      const { data: items } = await supabase
        .from('project_items')
        .select('project_id, is_done')
        .in('project_id', data.map((p) => p.id))
      const tally = {}
      for (const it of items || []) {
        if (!tally[it.project_id]) tally[it.project_id] = { done: 0, total: 0 }
        tally[it.project_id].total++
        if (it.is_done) tally[it.project_id].done++
      }
      setCounts(tally)
    }
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  async function remove(id, e) {
    e.stopPropagation()
    await supabase.from('projects').delete().eq('id', id)
    load()
  }

  return (
    <PageShell title="Project Planner">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 22 }}>Project Planner</h1>
        <button className="btn-primary" onClick={() => setShowNew(true)}>+ New Project</button>
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        Plan it out — strategy, checklist, and materials, all in one place.
      </p>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : projects.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No projects yet — start one with the button above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {projects.map((p) => {
            const c = counts[p.id]
            return (
              <div
                key={p.id}
                className="card"
                style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 10 }}
                onClick={() => navigate(`/projects/${p.id}`)}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {p.target_date
                      ? `Target: ${new Date(p.target_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'No target date'}
                    {c && c.total > 0 ? ` · ${c.done}/${c.total} done` : ''}
                  </div>
                </div>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={(e) => remove(p.id, e)}>Delete</button>
              </div>
            )
          })}
        </div>
      )}

      {showNew && (
        <NewProjectModal
          onClose={() => setShowNew(false)}
          onCreated={(proj) => { setShowNew(false); navigate(`/projects/${proj.id}`) }}
        />
      )}
    </PageShell>
  )
}
