import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import { NOTEBOOK_COLORS } from '../notebookColors'

function NotebookCover({ notebook, onClick, onEdit }) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        style={{
          width: '100%', aspectRatio: '3 / 4', border: 'none', borderRadius: '4px 10px 10px 4px',
          background: notebook.color, position: 'relative', cursor: 'pointer',
          boxShadow: '0 6px 14px rgba(0,0,0,0.15)', overflow: 'hidden',
          display: 'flex', alignItems: 'flex-end', padding: 14,
        }}
      >
        {/* spine */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: 'rgba(0,0,0,0.15)' }} />
        {/* binding rings */}
        <div style={{ position: 'absolute', left: 3, top: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
          ))}
        </div>
        <span
          style={{
            color: 'white', fontWeight: 800, fontSize: 14, textAlign: 'left', paddingLeft: 8,
            textShadow: '0 1px 3px rgba(0,0,0,0.25)', wordBreak: 'break-word',
          }}
        >
          {notebook.name}
        </span>
      </button>
      <button
        onClick={onEdit}
        aria-label="Edit notebook"
        className="btn-ghost"
        style={{
          position: 'absolute', top: 6, right: 6, background: 'rgba(255,255,255,0.85)',
          borderRadius: 8, padding: '3px 7px', fontSize: 12,
        }}
      >
        ✎
      </button>
    </div>
  )
}

function EditNotebookModal({ notebook, onClose, onSaved }) {
  const [name, setName] = useState(notebook.name)
  const [color, setColor] = useState(notebook.color)
  const [saving, setSaving] = useState(false)

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('notebooks').update({ name: name.trim() || 'Notebook', color }).eq('id', notebook.id)
    setSaving(false)
    onSaved()
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
    >
      <div className="card" style={{ maxWidth: 340, width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 17, marginBottom: 14 }}>Edit notebook</h3>
        <form onSubmit={save}>
          <div className="field">
            <label htmlFor="notebookName">Name</label>
            <input id="notebookName" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Color</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {NOTEBOOK_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: color === c ? '3px solid var(--ink)' : '3px solid transparent',
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NotebooksList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notebooks, setNotebooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingNotebook, setEditingNotebook] = useState(null)

  async function load() {
    setLoading(true)
    let { data } = await supabase
      .from('notebooks')
      .select('*')
      .eq('user_id', user.id)
      .order('slot', { ascending: true })

    if (!data || data.length < 5) {
      const existingSlots = new Set((data || []).map((n) => n.slot))
      const missing = []
      for (let slot = 1; slot <= 5; slot++) {
        if (!existingSlots.has(slot)) {
          missing.push({ user_id: user.id, slot, name: `Notebook ${slot}`, color: NOTEBOOK_COLORS[(slot - 1) % NOTEBOOK_COLORS.length] })
        }
      }
      if (missing.length > 0) {
        await supabase.from('notebooks').insert(missing)
        const { data: refreshed } = await supabase
          .from('notebooks')
          .select('*')
          .eq('user_id', user.id)
          .order('slot', { ascending: true })
        data = refreshed
      }
    }
    setNotebooks(data || [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  return (
    <PageShell title="Notebooks">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Notebooks</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        Five notebooks, all yours — rename them, recolor them, and fill them with whatever you like.
      </p>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16, maxWidth: 640 }}>
          {notebooks.map((nb) => (
            <NotebookCover
              key={nb.id}
              notebook={nb}
              onClick={() => navigate(`/notebooks/${nb.slot}`)}
              onEdit={(e) => { e.stopPropagation(); setEditingNotebook(nb) }}
            />
          ))}
        </div>
      )}

      {editingNotebook && (
        <EditNotebookModal
          notebook={editingNotebook}
          onClose={() => setEditingNotebook(null)}
          onSaved={() => { setEditingNotebook(null); load() }}
        />
      )}
    </PageShell>
  )
}
