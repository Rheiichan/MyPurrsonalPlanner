import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'
import { TRIP_TYPES, computeTripDuration, buildDefaultPackingList } from '../travel'

function NewTripModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [destination, setDestination] = useState('')
  const [tripType, setTripType] = useState('international')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [singleDate, setSingleDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save(e) {
    e.preventDefault()
    if (!destination.trim()) return
    const isDaytime = tripType === 'daytime'
    const start = isDaytime ? singleDate : startDate
    const end = isDaytime ? singleDate : endDate
    if (!start || (!isDaytime && !end)) return
    if (!isDaytime && new Date(end) < new Date(start)) {
      setError('End date must be on or after the start date.')
      return
    }

    setSaving(true)
    setError('')
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({ user_id: user.id, destination: destination.trim(), trip_type: tripType, start_date: start, end_date: end })
      .select()
      .maybeSingle()
    if (tripError) {
      setSaving(false)
      setError(tripError.message)
      return
    }

    const { days, nights } = computeTripDuration(start, end, tripType)
    const defaults = buildDefaultPackingList(tripType, days, nights)
    if (defaults.length > 0) {
      await supabase.from('trip_packing_items').insert(
        defaults.map((content, i) => ({ trip_id: trip.id, user_id: user.id, content, position: i + 1 }))
      )
    }

    setSaving(false)
    onCreated(trip)
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20, overflowY: 'auto' }}
    >
      <div className="card" style={{ maxWidth: 400, width: '100%', margin: '20px 0' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, marginBottom: 14 }}>New trip</h3>
        <form onSubmit={save}>
          <div className="field">
            <label htmlFor="destination">Destination</label>
            <input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Tokyo, Japan" required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="tripType">Trip type</label>
            <select id="tripType" value={tripType} onChange={(e) => setTripType(e.target.value)}>
              {TRIP_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>

          {tripType === 'daytime' ? (
            <div className="field">
              <label htmlFor="singleDate">Date</label>
              <input id="singleDate" type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} required />
            </div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="startDate">Start date</label>
                <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="endDate">End date</label>
                <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </>
          )}

          {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Creating…' : 'Create trip'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TravelPlanner() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
    setTrips(data || [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  async function remove(id, e) {
    e.stopPropagation()
    await supabase.from('trips').delete().eq('id', id)
    load()
  }

  return (
    <PageShell title="Travel Planner">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 22 }}>Travel Planner</h1>
        <button className="btn-primary" onClick={() => setShowNew(true)}>+ New Trip</button>
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        Destination, dates, itinerary, and packing — all in one place.
      </p>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : trips.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No trips yet — plan one with the button above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {trips.map((t) => {
            const { days } = computeTripDuration(t.start_date, t.end_date, t.trip_type)
            const typeLabel = TRIP_TYPES.find((x) => x.key === t.trip_type)?.label
            return (
              <div
                key={t.id}
                className="card"
                style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 10 }}
                onClick={() => navigate(`/travel/${t.id}`)}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.destination}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {typeLabel} · {new Date(t.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {t.trip_type !== 'daytime' && ` – ${new Date(t.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    {' · '}{days} day{days !== 1 ? 's' : ''}
                  </div>
                </div>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={(e) => remove(t.id, e)}>Delete</button>
              </div>
            )
          })}
        </div>
      )}

      {showNew && (
        <NewTripModal
          onClose={() => setShowNew(false)}
          onCreated={(trip) => { setShowNew(false); navigate(`/travel/${trip.id}`) }}
        />
      )}
    </PageShell>
  )
}
