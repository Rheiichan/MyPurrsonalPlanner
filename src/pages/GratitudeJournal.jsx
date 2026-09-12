import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import FolderTabs from '../components/FolderTabs'

const TABS = [
  { key: 'gratitude', label: 'Gratitude' },
  { key: 'achievements', label: 'Achievements' },
]

export default function GratitudeJournal() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'achievements' ? 'achievements' : 'gratitude'
  const [tab, setTab] = useState(initialTab)

  function switchTab(t) {
    setTab(t)
    setSearchParams(t === 'achievements' ? { tab: 'achievements' } : {})
  }

  return (
    <PageShell title="Gratitude Journal">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Gratitude Journal</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 18 }}>
        A place to focus on the present, and remember what you've already overcome.
      </p>

      <FolderTabs tabs={TABS} active={tab} onChange={switchTab}>
        {tab === 'gratitude' ? <GratitudeTab user={user} /> : <AchievementsTab user={user} />}
      </FolderTabs>
    </PageShell>
  )
}

function GratitudeTab({ user }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('gratitude_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(60)
    setEntries(data || [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  async function addEntry(e) {
    e.preventDefault()
    if (!content.trim()) return
    await supabase.from('gratitude_entries').insert({ user_id: user.id, content: content.trim() })
    setContent('')
    load()
  }

  async function remove(id) {
    await supabase.from('gratitude_entries').delete().eq('id', id)
    load()
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 20, background: 'var(--teal-100)', border: 'none' }}>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>What's something good about today?</h3>
        <form onSubmit={addEntry} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="I'm grateful for…"
            style={{ flex: 1, minWidth: 180, padding: '10px 12px', borderRadius: 10, border: '2px solid white' }}
          />
          <button className="btn-primary">Add</button>
        </form>
      </div>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : entries.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No entries yet — write your first one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((e) => (
            <div key={e.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'none', border: '1px solid var(--teal-100)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>{e.content}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                  {new Date(e.entry_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <button className="btn-ghost" onClick={() => remove(e.id)} style={{ fontSize: 12 }}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function AchievementsTab({ user }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(60)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  async function addItem(e) {
    e.preventDefault()
    if (!title.trim()) return
    await supabase.from('achievements').insert({ user_id: user.id, title: title.trim() })
    setTitle('')
    load()
  }

  async function remove(id) {
    await supabase.from('achievements').delete().eq('id', id)
    load()
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 20, background: 'var(--pink-100)', border: 'none' }}>
        <h3 style={{ fontSize: 15, marginBottom: 10 }}>A time you succeeded</h3>
        <form onSubmit={addItem} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Something you're proud of…"
            style={{ flex: 1, minWidth: 180, padding: '10px 12px', borderRadius: 10, border: '2px solid white' }}
          />
          <button className="btn-primary">Add</button>
        </form>
      </div>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Nothing listed yet — write down a win, big or small.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((a) => (
            <div key={a.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'none', border: '1px solid var(--teal-100)' }}>
              <div style={{ flex: 1, fontSize: 14 }}>{a.title}</div>
              <button className="btn-ghost" onClick={() => remove(a.id)} style={{ fontSize: 12 }}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
