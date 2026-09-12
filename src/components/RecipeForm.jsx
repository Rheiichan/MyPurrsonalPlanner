import { useState } from 'react'

const textareaStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 10, border: '2px solid var(--teal-100)',
  fontFamily: 'inherit', fontSize: 14, resize: 'vertical',
}

export default function RecipeForm({ initial, onSubmit, onCancel, submitLabel = 'Save recipe' }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [yieldText, setYieldText] = useState(initial?.yield_text || '')
  const [ingredients, setIngredients] = useState(initial?.ingredients || '')
  const [procedure, setProcedure] = useState(initial?.procedure || '')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !ingredients.trim() || !procedure.trim()) return
    setSaving(true)
    await onSubmit({
      title: title.trim(),
      yield_text: yieldText.trim() || null,
      ingredients: ingredients.trim(),
      procedure: procedure.trim(),
      notes: notes.trim() || null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="recipeTitle">Recipe name</label>
        <input id="recipeTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chicken Adobo" required />
      </div>
      <div className="field">
        <label htmlFor="recipeYield">Yield</label>
        <input id="recipeYield" value={yieldText} onChange={(e) => setYieldText(e.target.value)} placeholder="e.g. 4 servings" />
      </div>
      <div className="field">
        <label htmlFor="recipeIngredients">Ingredients (one per line)</label>
        <textarea
          id="recipeIngredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={6}
          placeholder={'2 cups rice\n1 lb chicken\n...'}
          style={textareaStyle}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="recipeProcedure">Procedure (one step per line)</label>
        <textarea
          id="recipeProcedure"
          value={procedure}
          onChange={(e) => setProcedure(e.target.value)}
          rows={6}
          placeholder={'Season the chicken.\nHeat oil in a pan.\n...'}
          style={textareaStyle}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="recipeNotes">Notes (optional)</label>
        <textarea
          id="recipeNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Tips, substitutions, storage…"
          style={textareaStyle}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  )
}
