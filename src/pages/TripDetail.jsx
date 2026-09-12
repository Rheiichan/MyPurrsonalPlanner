import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import FolderTabs from '../components/FolderTabs'
import { TRIP_TYPES, computeTripDuration } from '../travel'

export default function TripDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [itineraryItems, setItineraryItems] = useState([])
  const [packingItems, setPackingItems] = useState([])
  const [activeDay, setActiveDay] = useState(1)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data: t } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!t) { navigate('/travel'); return }
    setTrip(t)

    const [{ data: itin }, { data: pack }] = await Promise.all([
      supabase.from('trip_itinerary_items').select('*').eq('trip_id', id).order('day_number').order('position'),
      supabase.from('trip_packing_items').select('*').eq('trip_id', id).order('position'),
    ])
    setItineraryItems(itin || [])
    setPackingItems(pack || [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user, id])

  async function addItinerary(dayNumber, content) {
    const dayItems = itineraryItems.filter((it) => it.day_number === dayNumber)
    const nextPosition = dayItems.length > 0 ? Math.max(...dayItems.map((it) => it.position)) + 1 : 1
    const { data } = await supabase
      .from('trip_itinerary_items')
      .insert({ trip_id: id, user_id: user.id, day_number: dayNumber, content, position: nextPosition })
      .select()
      .maybeSingle()
    if (data) setItineraryItems((prev) => [...prev, data])
  }

  async function toggleItinerary(item) {
    await supabase.from('trip_itinerary_items').update({ is_done: !item.is_done }).eq('id', item.id)
    setItineraryItems((prev) => prev.map((it) => it.id === item.id ? { ...it, is_done: !it.is_done } : it))
  }

  async function removeItinerary(itemId) {
    await supabase.from('trip_itinerary_items').delete().eq('id', itemId)
    setItineraryItems((prev) => prev.filter((it) => it.id !== itemId))
  }

  async function addPacking(content) {
    const nextPosition = packingItems.length > 0 ? Math.max(...packingItems.map((it) => it.position)) + 1 : 1
    const { data } = await supabase
      .from('trip_packing_items')
      .insert({ trip_id: id, user_id: user.id, content, position: nextPosition })
      .select()
      .maybeSingle()
    if (data) setPackingItems((prev) => [...prev, data])
  }

  async function togglePacking(item) {
    await supabase.from('trip_packing_items').update({ is_done: !item.is_done }).eq('id', item.id)
    setPackingItems((prev) => prev.map((it) => it.id === item.id ? { ...it, is_done: !it.is_done } : it))
  }

  async function removePacking(itemId) {
    await supabase.from('trip_packing_items').delete().eq('id', itemId)
    setPackingItems((prev) => prev.filter((it) => it.id !== itemId))
  }

  if (loading || !trip) {
    return (
      <PageShell title="Trip">
        <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
      </PageShell>
    )
  }

  const { days } = computeTripDuration(trip.start_date, trip.end_date, trip.trip_type)
  const typeLabel = TRIP_TYPES.find((x) => x.key === trip.trip_type)?.label
  const dayTabs = Array.from({ length: days }, (_, i) => ({ key: i + 1, label: `Day ${i + 1}` }))

  return (
    <PageShell title={trip.destination}>
      <button className="btn-ghost" style={{ fontSize: 13, marginBottom: 10 }} onClick={() => navigate('/travel')}>
        ← All trips
      </button>

      <h1 style={{ fontSize: 22 }}>{trip.destination}</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        {typeLabel} · {new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        {trip.trip_type !== 'daytime' && ` – ${new Date(trip.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
        {' · '}{days} day{days !== 1 ? 's' : ''}
      </p>

      <h3 style={{ fontSize: 15, marginBottom: 10 }}>Itinerary</h3>
      <div style={{ marginBottom: 24 }}>
        <FolderTabs tabs={dayTabs.map((d) => ({ key: String(d.key), label: d.label }))} active={String(activeDay)} onChange={(k) => setActiveDay(Number(k))} size="sm" scrollable>
          <DayChecklist
            items={itineraryItems.filter((it) => it.day_number === activeDay)}
            onAdd={(content) => addItinerary(activeDay, content)}
            onToggle={toggleItinerary}
            onRemove={removeItinerary}
            placeholder="Add to today's itinerary…"
          />
        </FolderTabs>
      </div>

      <h3 style={{ fontSize: 15, marginBottom: 10 }}>Things to Bring</h3>
      <div className="card">
        <DayChecklist
          items={packingItems}
          onAdd={addPacking}
          onToggle={togglePacking}
          onRemove={removePacking}
          placeholder="Add an item…"
        />
      </div>
    </PageShell>
  )
}

function DayChecklist({ items, onAdd, onToggle, onRemove, placeholder }) {
  const [newText, setNewText] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!newText.trim()) return
    onAdd(newText.trim())
    setNewText('')
  }

  return (
    <div>
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
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '2px solid var(--teal-100)', fontSize: 13 }}
        />
        <button className="btn-secondary" style={{ fontSize: 13, padding: '8px 14px' }}>Add</button>
      </form>
    </div>
  )
}
