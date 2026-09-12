import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'

const MAX_ITEMS = 15
const SECTIONS = [
  { key: 'strategy', title: 'Strategy / Ideas', placeholder: 'Add an idea…' },
  { key: 'checklist', title: 'Checklist', placeholder: 'Add a to-do…' },
  { key: 'materials', title: 'Required Materials', placeholder: 'Add a material…' },
]

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingHeader, setEditingHeader] = useState(false)

  async function load() {
    setLoading(true)
    const { data: proj } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!proj) { navigate('/projects'); return }
    setProject(proj)

    const { data: its } = await supabase
      .from('project_items')
      .select('*')
      .eq('project_id', id)
      .order('position', { ascending: true })
    setItems(its || [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user, id])

  async function addItem(section, content) {
    const sectionItems = items.filter((it) => it.section === section)
    if (sectionItems.length >= MAX_ITEMS) return
    const nextPosition = sectionItems.length > 0 ? Math.max(...sectionItems.map((it) => it.position)) + 1 : 1
    const { data } = await supabase
      .from('project_items')
      .insert({ project_id: id, user_id: user.id, section, content, position: nextPosition })
      .select()
      .maybeSingle()
    if (data) setItems((prev) => [...prev, data])
  }

  async function toggleItem(item) {
    await supabase.from('project_items').update({ is_done: !item.is_done }).eq('id', item.id)
    setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, is_done: !it.is_done } : it))
  }

  async function removeItem(itemId) {
    await supabase.from('project_items').delete().eq('id', itemId)
    setItems((prev) => prev.filter((it) => it.id !== itemId))
  }

  if (loading || !project) {
    return (
      <PageShell title="Project">
        <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
      </PageShell>
    )
  }

  return (
    <PageShell title={project.name}>
      <button className="btn-ghost" style={{ fontSize: 13, marginBottom: 10 }} onClick={() => navigate('/projects')}>
        ← All projects
      </button>

      {editingHeader ? (
        <ProjectHeaderEditor project={project} onSaved={(p) => { setProject(p); setEditingHeader(false) }} onCancel={() => setEditingHeader(false)} />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 22 }}>{project.name}</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>
              {project.target_date
                ? `Target: ${new Date(project.target_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                : 'No target date set'}
            </p>
          </div>
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setEditingHeader(true)}>Edit</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {SECTIONS.map((s) => (
          <ChecklistSection
            key={s.key}
            section={s}
            items={items.filter((it) => it.section === s.key)}
            onAdd={(content) => addItem(s.key, content)}
            onToggle={toggleItem}
            onRemove={removeItem}
          />
        ))}
      </div>
    </PageShell>
  )
}

function ProjectHeaderEditor({ project, onSaved, onCancel }) {
  const [name, setName] = useState(project.name)
  const [targetDate, setTargetDate] = useState(project.target_date || '')
  const [saving, setSaving] = useState(false)

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const { data } = await supabase
      .from('projects')
      .update({ name: name.trim() || project.name, target_date: targetDate || null })
      .eq('id', project.id)
      .select()
      .maybeSingle()
    setSaving(false)
    onSaved(data)
  }

  return (
    <form onSubmit={save} className="card" style={{ marginBottom: 20 }}>
      <div className="field">
        <label htmlFor="editName">Project name</label>
        <input id="editName" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
      <div className="field">
        <label htmlFor="editDate">Target date</label>
        <input id="editDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  )
}

function ChecklistSection({ section, items, onAdd, onToggle, onRemove }) {
  const [newText, setNewText] = useState('')
  const atMax = items.length >= MAX_ITEMS

  function handleAdd(e) {
    e.preventDefault()
    if (!newText.trim() || atMax) return
    onAdd(newText.trim())
    setNewText('')
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 15 }}>{section.title}</h3>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{items.length}/{MAX_ITEMS}</span>
      </div>

      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12 }}>Nothing here yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {items.map((it) => (
            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" checked={it.is_done} onChange={() => onToggle(it)} />
              <span style={{ flex: 1, fontSize: 14, textDecoration: it.is_done ? 'line-through' : 'none', color: it.is_done ? 'var(--ink-soft)' : 'var(--ink)' }}>
                {it.content}
              </span>
              <button className="btn-ghost" onClick={() => onRemove(it.id)} style={{ fontSize: 12 }}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {!atMax ? (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={section.placeholder}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '2px solid var(--teal-100)', fontSize: 13 }}
          />
          <button className="btn-secondary" style={{ fontSize: 13, padding: '8px 14px' }}>Add</button>
        </form>
      ) : (
        <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Max of {MAX_ITEMS} reached for this list.</p>
      )}
    </div>
  )
}
