import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function QuickTodoWidget() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newText, setNewText] = useState('')
  const [removingIds, setRemovingIds] = useState(new Set())

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('quick_todos')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  async function addItem(e) {
    e.preventDefault()
    if (!newText.trim()) return
    const nextPosition = items.length > 0 ? Math.max(...items.map((i) => i.position)) + 1 : 1
    const { data } = await supabase
      .from('quick_todos')
      .insert({ user_id: user.id, content: newText.trim(), position: nextPosition })
      .select()
      .maybeSingle()
    if (data) setItems((prev) => [...prev, data])
    setNewText('')
  }

  // Checking an item off deletes it right away (fast-capture, not a
  // persistent checklist) — a brief fade gives a moment of feedback first.
  async function checkOff(item) {
    setRemovingIds((prev) => new Set(prev).add(item.id))
    await supabase.from('quick_todos').delete().eq('id', item.id)
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    }, 250)
  }

  return (
    <div>
      <h3 style={{ fontSize: 16, marginBottom: 10 }}>Quick To-Do</h3>
      <form onSubmit={addItem} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add something quick…"
          style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '2px solid white', fontSize: 13 }}
        />
        <button className="btn-secondary" style={{ padding: '9px 16px', fontSize: 13 }}>Add</button>
      </form>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Nothing on your quick list — add something above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item) => {
            const isRemoving = removingIds.has(item.id)
            return (
              <label
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
                  opacity: isRemoving ? 0 : 1, transition: 'opacity 0.25s ease', cursor: 'pointer',
                }}
              >
                <input type="checkbox" checked={isRemoving} onChange={() => checkOff(item)} disabled={isRemoving} />
                <span>{item.content}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
