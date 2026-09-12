import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import RecipeForm from '../components/RecipeForm'
import { openRecipePdf } from '../recipePdf'
import { DEFAULT_RECIPES, DEFAULT_RECIPE_CATEGORIES } from '../defaultRecipes'

const TABS = [
  { key: 'create', label: 'Create your Recipe' },
  { key: 'saved', label: 'Your Saved Recipes' },
  { key: 'default', label: 'Default Recipes' },
]

export default function Recipes() {
  const [tab, setTab] = useState('create')

  return (
    <PageShell title="Recipes">
      <h1 style={{ fontSize: 22, marginBottom: 18 }}>Recipes</h1>

      {/* Folder-style tabs */}
      <div style={{ display: 'flex', gap: 4 }}>
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '11px 18px',
                borderRadius: '12px 12px 0 0',
                border: '1px solid var(--pink-300)',
                borderBottom: active ? '1px solid white' : '1px solid var(--pink-300)',
                background: active ? 'white' : 'var(--pink-100)',
                color: active ? 'var(--ink)' : 'var(--pink-700)',
                fontWeight: 700, fontSize: 13,
                position: 'relative', top: 1, zIndex: active ? 2 : 1,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div
        style={{
          background: 'white', border: '1px solid var(--pink-300)', borderRadius: '0 12px 12px 12px',
          padding: 20, position: 'relative', zIndex: 1, marginBottom: 20,
        }}
      >
        {tab === 'create' && <CreateTab onSaved={() => setTab('saved')} />}
        {tab === 'saved' && <SavedTab />}
        {tab === 'default' && <DefaultTab />}
      </div>
    </PageShell>
  )
}

function CreateTab({ onSaved }) {
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  async function handleSubmit(values) {
    setError('')
    const { error } = await supabase.from('user_recipes').insert({ user_id: user.id, ...values })
    if (error) { setError(error.message); return }
    setJustSaved(true)
    setTimeout(() => onSaved(), 700)
  }

  return (
    <div>
      <h3 style={{ fontSize: 15, marginBottom: 4 }}>Create your Recipe</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16 }}>
        Fill this in and save it to your own recipe collection.
      </p>
      {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {justSaved && <p style={{ color: 'var(--teal-700)', fontSize: 13, marginBottom: 12 }}>Saved! Taking you to your recipes…</p>}
      <RecipeForm onSubmit={handleSubmit} submitLabel="Save recipe" />
    </div>
  )
}

function SavedTab() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('user_recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setRecipes(data || [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  async function saveEdit(id, values) {
    await supabase.from('user_recipes').update(values).eq('id', id)
    setEditingId(null)
    load()
  }

  async function remove(id) {
    await supabase.from('user_recipes').delete().eq('id', id)
    load()
  }

  if (loading) return <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
  if (recipes.length === 0) {
    return <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No recipes saved yet — add one from the "Create your Recipe" tab.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {recipes.map((r) => {
        if (editingId === r.id) {
          return (
            <div key={r.id} className="card" style={{ border: '1px solid var(--teal-100)', boxShadow: 'none' }}>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Edit recipe</h3>
              <RecipeForm
                initial={r}
                submitLabel="Save changes"
                onCancel={() => setEditingId(null)}
                onSubmit={(values) => saveEdit(r.id, values)}
              />
            </div>
          )
        }
        const expanded = expandedId === r.id
        return (
          <div key={r.id} className="card" style={{ border: '1px solid var(--teal-100)', boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }} onClick={() => setExpandedId(expanded ? null : r.id)}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.title}</div>
                {r.yield_text && <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Yield: {r.yield_text}</div>}
              </div>
              <span style={{ fontSize: 12, color: 'var(--teal-700)', fontWeight: 700, flexShrink: 0 }}>{expanded ? 'Collapse ▲' : 'View ▾'}</span>
            </div>

            {expanded && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Ingredients</p>
                <ul style={{ fontSize: 13, margin: '0 0 10px', paddingLeft: 18 }}>
                  {r.ingredients.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                </ul>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Procedure</p>
                <ol style={{ fontSize: 13, margin: '0 0 10px', paddingLeft: 18 }}>
                  {r.procedure.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                </ol>
                {r.notes && (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Notes</p>
                    <p style={{ fontSize: 13, marginBottom: 10 }}>{r.notes}</p>
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setEditingId(r.id)}>Edit</button>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => openRecipePdf(r)}>Open PDF</button>
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => remove(r.id)}>Delete</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DefaultTab() {
  const { user } = useAuth()
  const [category, setCategory] = useState('All')
  const [expandedId, setExpandedId] = useState(null)
  const [savedMsg, setSavedMsg] = useState('')

  const shown = category === 'All' ? DEFAULT_RECIPES : DEFAULT_RECIPES.filter((r) => r.category === category)

  async function saveACopy(recipe) {
    await supabase.from('user_recipes').insert({
      user_id: user.id,
      title: recipe.title,
      yield_text: recipe.yield_text,
      ingredients: recipe.ingredients,
      procedure: recipe.procedure,
      notes: recipe.notes,
    })
    setSavedMsg(`"${recipe.title}" added to Your Saved Recipes.`)
    setTimeout(() => setSavedMsg(''), 3000)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['All', ...DEFAULT_RECIPE_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={category === c ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: 12.5 }}
          >
            {c}
          </button>
        ))}
      </div>
      {savedMsg && <p style={{ color: 'var(--teal-700)', fontSize: 13, marginBottom: 12 }}>{savedMsg}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {shown.map((r) => {
          const expanded = expandedId === r.id
          return (
            <div key={r.id} className="card" style={{ border: '1px solid var(--teal-100)', boxShadow: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }} onClick={() => setExpandedId(expanded ? null : r.id)}>
                <div>
                  <span className="pill" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', marginBottom: 4, display: 'inline-block' }}>{r.category}</span>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.title}</div>
                  {r.yield_text && <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Yield: {r.yield_text}</div>}
                </div>
                <span style={{ fontSize: 12, color: 'var(--teal-700)', fontWeight: 700, flexShrink: 0 }}>{expanded ? 'Collapse ▲' : 'View ▾'}</span>
              </div>

              {expanded && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Ingredients</p>
                  <ul style={{ fontSize: 13, margin: '0 0 10px', paddingLeft: 18 }}>
                    {r.ingredients.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                  </ul>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Procedure</p>
                  <ol style={{ fontSize: 13, margin: '0 0 10px', paddingLeft: 18 }}>
                    {r.procedure.split('\n').map((line, i) => <li key={i}>{line}</li>)}
                  </ol>
                  {r.notes && (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Notes</p>
                      <p style={{ fontSize: 13, marginBottom: 10 }}>{r.notes}</p>
                    </>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => saveACopy(r)}>Save a copy for myself</button>
                    <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => openRecipePdf(r)}>Open PDF</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
