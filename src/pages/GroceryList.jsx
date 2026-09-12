import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import FolderTabs from '../components/FolderTabs'
import { GROCERY } from '../groceryData'

const TABS = [
  { key: 'preloaded', label: 'Preloaded List' },
  { key: 'custom', label: 'Custom' },
]

export default function GroceryList() {
  const [tab, setTab] = useState('preloaded')

  return (
    <PageShell title="Grocery List">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Grocery List</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 18 }}>
        A tailored list for your diet mode, plus your own custom items.
      </p>

      <FolderTabs tabs={TABS} active={tab} onChange={setTab}>
        {tab === 'preloaded' ? <PreloadedTab /> : <CustomTab />}
      </FolderTabs>
    </PageShell>
  )
}

function PreloadedTab() {
  const { user, profile } = useAuth()
  const dietCategory = profile?.diet_category
  const items = dietCategory ? GROCERY[dietCategory] || [] : []
  const [checked, setChecked] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !dietCategory) { setLoading(false); return }
    supabase
      .from('grocery_checks')
      .select('item_text')
      .eq('user_id', user.id)
      .eq('diet_category', dietCategory)
      .then(({ data }) => {
        setChecked(new Set((data || []).map((r) => r.item_text)))
        setLoading(false)
      })
  }, [user, dietCategory])

  async function toggle(item) {
    const isChecked = checked.has(item)
    if (isChecked) {
      await supabase
        .from('grocery_checks')
        .delete()
        .eq('user_id', user.id)
        .eq('diet_category', dietCategory)
        .eq('item_text', item)
    } else {
      await supabase
        .from('grocery_checks')
        .insert({ user_id: user.id, diet_category: dietCategory, item_text: item })
    }
    setChecked((prev) => {
      const next = new Set(prev)
      if (isChecked) next.delete(item)
      else next.add(item)
      return next
    })
  }

  if (!dietCategory) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 10px' }}>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 14 }}>
          Set up your diet mode in the Fitness Tracker to see a tailored grocery list here.
        </p>
        <Link to="/fitness" className="btn-primary" style={{ textDecoration: 'none' }}>Go to Fitness Tracker</Link>
      </div>
    )
  }

  if (loading) return <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14 }}>
        Based on your <strong style={{ color: 'var(--ink)' }}>{dietCategory}</strong> diet mode — {checked.size}/{items.length} checked.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item) => {
          const isChecked = checked.has(item)
          return (
            <label
              key={item}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 10, border: '1px solid var(--teal-100)', cursor: 'pointer',
                background: isChecked ? 'var(--teal-100)' : 'white',
              }}
            >
              <input type="checkbox" checked={isChecked} onChange={() => toggle(item)} />
              <span style={{ fontSize: 14, textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--ink-soft)' : 'var(--ink)' }}>
                {item}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function CustomTab() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('grocery_custom_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  async function addItem(e) {
    e.preventDefault()
    if (!newItem.trim()) return
    await supabase.from('grocery_custom_items').insert({ user_id: user.id, item_text: newItem.trim() })
    setNewItem('')
    load()
  }

  async function toggle(item) {
    await supabase.from('grocery_custom_items').update({ is_checked: !item.is_checked }).eq('id', item.id)
    load()
  }

  async function remove(id) {
    await supabase.from('grocery_custom_items').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <form onSubmit={addItem} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an item…"
          style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '2px solid var(--teal-100)' }}
        />
        <button className="btn-primary">Add</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No custom items yet — add one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 10, border: '1px solid var(--teal-100)',
                background: item.is_checked ? 'var(--teal-100)' : 'white',
              }}
            >
              <input type="checkbox" checked={item.is_checked} onChange={() => toggle(item)} />
              <span style={{ flex: 1, fontSize: 14, textDecoration: item.is_checked ? 'line-through' : 'none', color: item.is_checked ? 'var(--ink-soft)' : 'var(--ink)' }}>
                {item.item_text}
              </span>
              <button className="btn-ghost" onClick={() => remove(item.id)} style={{ fontSize: 12 }}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
