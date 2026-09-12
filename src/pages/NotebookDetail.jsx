import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import FolderTabs from '../components/FolderTabs'

const MAX_PAGES = 25
const DEFAULT_PAGE_COUNT = 5

export default function NotebookDetail() {
  const { slot } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notebook, setNotebook] = useState(null)
  const [pages, setPages] = useState([])
  const [activePageId, setActivePageId] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data: nb } = await supabase
      .from('notebooks')
      .select('*')
      .eq('user_id', user.id)
      .eq('slot', Number(slot))
      .maybeSingle()

    if (!nb) {
      navigate('/notebooks')
      return
    }
    setNotebook(nb)

    let { data: pgs } = await supabase
      .from('notebook_pages')
      .select('*')
      .eq('notebook_id', nb.id)
      .order('position', { ascending: true })

    if (!pgs || pgs.length === 0) {
      const defaults = Array.from({ length: DEFAULT_PAGE_COUNT }, (_, i) => ({
        notebook_id: nb.id, user_id: user.id, title: `Page ${i + 1}`, content: '', position: i + 1,
      }))
      await supabase.from('notebook_pages').insert(defaults)
      const { data: refreshed } = await supabase
        .from('notebook_pages')
        .select('*')
        .eq('notebook_id', nb.id)
        .order('position', { ascending: true })
      pgs = refreshed
    }

    setPages(pgs || [])
    setActivePageId((current) => current || pgs?.[0]?.id || null)
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user, slot])

  async function addPage() {
    if (pages.length >= MAX_PAGES) return
    const nextPosition = pages.length > 0 ? Math.max(...pages.map((p) => p.position)) + 1 : 1
    const { data } = await supabase
      .from('notebook_pages')
      .insert({ notebook_id: notebook.id, user_id: user.id, title: `Page ${pages.length + 1}`, content: '', position: nextPosition })
      .select()
      .maybeSingle()
    setPages((prev) => [...prev, data])
    setActivePageId(data.id)
  }

  async function deletePage(pageId) {
    if (pages.length <= 1) return
    await supabase.from('notebook_pages').delete().eq('id', pageId)
    const remaining = pages.filter((p) => p.id !== pageId)
    setPages(remaining)
    if (activePageId === pageId) setActivePageId(remaining[0]?.id || null)
  }

  if (loading || !notebook) {
    return (
      <PageShell title="Notebook">
        <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
      </PageShell>
    )
  }

  const activePage = pages.find((p) => p.id === activePageId)
  const tabs = pages.map((p) => ({ key: p.id, label: p.title }))

  return (
    <PageShell title={notebook.name}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 22, color: notebook.color }}>{notebook.name}</h1>
        <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/notebooks')}>← All notebooks</button>
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 18 }}>
        {pages.length}/{MAX_PAGES} pages
      </p>

      <FolderTabs tabs={tabs} active={activePageId} onChange={setActivePageId} size="sm" scrollable>
        {activePage && (
          <PageEditor
            key={activePage.id}
            page={activePage}
            canDelete={pages.length > 1}
            onDelete={() => deletePage(activePage.id)}
            onRenamed={(newTitle) => setPages((prev) => prev.map((p) => p.id === activePage.id ? { ...p, title: newTitle } : p))}
          />
        )}
      </FolderTabs>

      {pages.length < MAX_PAGES && (
        <button className="btn-secondary" style={{ marginTop: 14, fontSize: 13 }} onClick={addPage}>
          + Add page
        </button>
      )}
    </PageShell>
  )
}

function PageEditor({ page, canDelete, onDelete, onRenamed }) {
  const [title, setTitle] = useState(page.title)
  const [content, setContent] = useState(page.content || '')
  const [renaming, setRenaming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function saveContent() {
    setSaving(true)
    await supabase.from('notebook_pages').update({ content }).eq('id', page.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function saveRename(e) {
    e.preventDefault()
    const finalTitle = title.trim() || 'Page'
    await supabase.from('notebook_pages').update({ title: finalTitle }).eq('id', page.id)
    setTitle(finalTitle)
    setRenaming(false)
    onRenamed(finalTitle)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        {renaming ? (
          <form onSubmit={saveRename} style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '2px solid var(--teal-100)', fontSize: 13 }} />
            <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>Save name</button>
          </form>
        ) : (
          <button className="btn-ghost" style={{ fontSize: 13, fontWeight: 700 }} onClick={() => setRenaming(true)}>
            {page.title} ✎
          </button>
        )}
        {canDelete && (
          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onDelete}>Delete this page</button>
        )}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={12}
        placeholder="Write anything here…"
        style={{ width: '100%', padding: 14, borderRadius: 10, border: '2px solid var(--teal-100)', fontFamily: 'inherit', fontSize: 14, resize: 'vertical', marginBottom: 10 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn-primary" onClick={saveContent} disabled={saving}>{saving ? 'Saving…' : 'Save page'}</button>
        {saved && <span style={{ fontSize: 13, color: 'var(--teal-700)' }}>Saved!</span>}
      </div>
    </div>
  )
}
