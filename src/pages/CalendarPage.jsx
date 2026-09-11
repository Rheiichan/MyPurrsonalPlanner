import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell'

const EVENT_TYPES = [
  { key: 'personal', label: 'Personal', color: '#4FBDB0' },
  { key: 'work', label: 'Work', color: '#7C8CE8' },
  { key: 'health', label: 'Health', color: '#FF8FA3' },
  { key: 'social', label: 'Social', color: '#F4B45A' },
  { key: 'reminder', label: 'Reminder', color: '#9B7EDE' },
  { key: 'other', label: 'Other', color: '#B0B0B0' },
]

function toISO(d) {
  return d.toLocaleDateString('en-CA')
}
function startOfWeek(d) {
  const date = new Date(d)
  const day = date.getDay()
  date.setDate(date.getDate() - day)
  date.setHours(0, 0, 0, 0)
  return date
}
function addDays(d, n) {
  const date = new Date(d)
  date.setDate(date.getDate() + n)
  return date
}
function monthGrid(d) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1)
  const gridStart = startOfWeek(first)
  const days = []
  for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i))
  return days
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [view, setView] = useState('month') // 'day' | 'week' | 'month'
  const [cursor, setCursor] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [todos, setTodos] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newType, setNewType] = useState('personal')
  const [newNotes, setNewNotes] = useState('')
  const [newTodo, setNewTodo] = useState('')

  const rangeStart = useMemo(() => {
    if (view === 'day') return new Date(selectedDate.setHours(0, 0, 0, 0))
    if (view === 'week') return startOfWeek(cursor)
    return startOfWeek(new Date(cursor.getFullYear(), cursor.getMonth(), 1))
  }, [view, cursor, selectedDate])

  const rangeEnd = useMemo(() => {
    if (view === 'day') return addDays(rangeStart, 1)
    if (view === 'week') return addDays(rangeStart, 7)
    return addDays(rangeStart, 42)
  }, [rangeStart, view])

  useEffect(() => {
    if (!user) return
    supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('event_date', toISO(rangeStart))
      .lt('event_date', toISO(rangeEnd))
      .order('event_time', { ascending: true, nullsFirst: false })
      .then(({ data }) => setEvents(data || []))
  }, [user, rangeStart, rangeEnd])

  useEffect(() => {
    if (!user) return
    supabase
      .from('daily_todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('todo_date', toISO(selectedDate))
      .order('created_at', { ascending: true })
      .then(({ data }) => setTodos(data || []))
  }, [user, selectedDate])

  function eventsFor(dateObj) {
    const iso = toISO(dateObj)
    return events.filter((e) => e.event_date === iso)
  }

  async function refreshEvents() {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('event_date', toISO(rangeStart))
      .lt('event_date', toISO(rangeEnd))
      .order('event_time', { ascending: true, nullsFirst: false })
    setEvents(data || [])
  }

  async function refreshTodos() {
    const { data } = await supabase
      .from('daily_todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('todo_date', toISO(selectedDate))
      .order('created_at', { ascending: true })
    setTodos(data || [])
  }

  async function addEvent(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const type = EVENT_TYPES.find((t) => t.key === newType)
    await supabase.from('calendar_events').insert({
      user_id: user.id,
      title: newTitle.trim(),
      notes: newNotes.trim() || null,
      event_date: toISO(selectedDate),
      event_time: newTime || null,
      event_type: newType,
      color: type.color,
    })
    setNewTitle('')
    setNewTime('')
    setNewNotes('')
    setNewType('personal')
    setShowForm(false)
    refreshEvents()
  }

  async function deleteEvent(id) {
    await supabase.from('calendar_events').delete().eq('id', id)
    refreshEvents()
  }

  async function addTodo(e) {
    e.preventDefault()
    if (!newTodo.trim()) return
    await supabase.from('daily_todos').insert({
      user_id: user.id,
      todo_date: toISO(selectedDate),
      content: newTodo.trim(),
    })
    setNewTodo('')
    refreshTodos()
  }

  async function toggleTodo(t) {
    await supabase.from('daily_todos').update({ is_done: !t.is_done }).eq('id', t.id)
    refreshTodos()
  }

  async function deleteTodo(id) {
    await supabase.from('daily_todos').delete().eq('id', id)
    refreshTodos()
  }

  function goToday() {
    const now = new Date()
    setCursor(now)
    setSelectedDate(now)
  }
  function navigate(delta) {
    if (view === 'day') {
      const d = addDays(selectedDate, delta)
      setSelectedDate(d)
      setCursor(d)
    } else if (view === 'week') {
      setCursor(addDays(cursor, delta * 7))
    } else {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1))
    }
  }

  const headerLabel =
    view === 'day'
      ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : view === 'week'
      ? `${rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${addDays(rangeStart, 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const todayIso = toISO(new Date())

  return (
    <PageShell title="Calendar">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22 }}>Calendar</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 2 }}>{headerLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--teal-100)', borderRadius: 100, padding: 3 }}>
            {['day', 'week', 'month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  border: 'none', borderRadius: 100, padding: '7px 14px', fontSize: 13, fontWeight: 700,
                  background: view === v ? 'var(--teal-500)' : 'transparent',
                  color: view === v ? 'white' : 'var(--teal-900)',
                }}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn-ghost" onClick={() => navigate(-1)} aria-label="Previous">◀</button>
          <button className="btn-secondary" onClick={goToday} style={{ padding: '7px 14px' }}>Today</button>
          <button className="btn-ghost" onClick={() => navigate(1)} aria-label="Next">▶</button>
        </div>
      </div>

      {view !== 'day' && (
        <>
          <div className="card" style={{ background: 'var(--pink-100)', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>
              {toISO(selectedDate) === todayIso ? "Today's" : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} agenda
            </h3>
            <MiniAgenda
              events={eventsFor(selectedDate)}
              onDelete={deleteEvent}
              showForm={showForm}
              setShowForm={setShowForm}
              newTitle={newTitle} setNewTitle={setNewTitle}
              newTime={newTime} setNewTime={setNewTime}
              newType={newType} setNewType={setNewType}
              newNotes={newNotes} setNewNotes={setNewNotes}
              onAdd={addEvent}
            />
          </div>

          <TodoCard
            selectedDate={selectedDate}
            todos={todos}
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            onAdd={addTodo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        </>
      )}

      <div className="card">
        {view === 'month' && (
          <MonthView
            cursor={cursor}
            selectedDate={selectedDate}
            onSelect={(d) => setSelectedDate(d)}
            eventsFor={eventsFor}
            todayIso={todayIso}
          />
        )}
        {view === 'week' && (
          <WeekView
            start={rangeStart}
            selectedDate={selectedDate}
            onSelect={(d) => setSelectedDate(d)}
            eventsFor={eventsFor}
            todayIso={todayIso}
          />
        )}
        {view === 'day' && (
          <DayView
            date={selectedDate}
            events={eventsFor(selectedDate)}
            onDelete={deleteEvent}
            showForm={showForm}
            setShowForm={setShowForm}
            newTitle={newTitle} setNewTitle={setNewTitle}
            newTime={newTime} setNewTime={setNewTime}
            newType={newType} setNewType={setNewType}
            newNotes={newNotes} setNewNotes={setNewNotes}
            onAdd={addEvent}
          />
        )}
      </div>

      {view === 'day' && (
        <TodoCard
          selectedDate={selectedDate}
          todos={todos}
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          onAdd={addTodo}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      )}
    </PageShell>
  )
}

function EventForm({ showForm, setShowForm, newTitle, setNewTitle, newTime, setNewTime, newType, setNewType, newNotes, setNewNotes, onAdd }) {
  if (!showForm) {
    return (
      <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setShowForm(true)}>
        + Add event
      </button>
    )
  }
  return (
    <form onSubmit={onAdd} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
      <input
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="Event title"
        autoFocus
        style={{ padding: '9px 12px', borderRadius: 10, border: '2px solid var(--teal-100)' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '2px solid var(--teal-100)' }}
        />
        <select value={newType} onChange={(e) => setNewType(e.target.value)} style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '2px solid var(--teal-100)' }}>
          {EVENT_TYPES.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </div>
      <input
        value={newNotes}
        onChange={(e) => setNewNotes(e.target.value)}
        placeholder="Notes (optional)"
        style={{ padding: '9px 12px', borderRadius: 10, border: '2px solid var(--teal-100)' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
        <button className="btn-primary" style={{ flex: 1 }}>Save event</button>
      </div>
    </form>
  )
}

function EventList({ events, onDelete }) {
  if (events.length === 0) return <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Nothing scheduled.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {events.map((ev) => (
        <div key={ev.id} className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'none', border: '1px solid var(--teal-100)' }}>
          <span style={{ width: 9, height: 9, borderRadius: 9, background: ev.color, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{ev.title}</div>
            {ev.notes && <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{ev.notes}</div>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', minWidth: 50, textAlign: 'right' }}>
            {ev.event_time ? ev.event_time.slice(0, 5) : 'All day'}
          </div>
          <button className="btn-ghost" onClick={() => onDelete(ev.id)} style={{ fontSize: 12 }}>×</button>
        </div>
      ))}
    </div>
  )
}

function DayView(props) {
  const { date, events, onDelete } = props
  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 14 }}>
        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </h2>
      <div style={{ marginBottom: 14 }}>
        <EventForm {...props} />
      </div>
      <EventList events={events} onDelete={onDelete} />
    </div>
  )
}

function MiniAgenda(props) {
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <EventForm {...props} />
      </div>
      <EventList events={props.events} onDelete={props.onDelete} />
    </>
  )
}

function TodoCard({ selectedDate, todos, newTodo, setNewTodo, onAdd, onToggle, onDelete }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>
        To-dos for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </h3>
      <form onSubmit={onAdd} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a to-do…"
          style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '2px solid var(--teal-100)' }}
        />
        <button className="btn-secondary" style={{ padding: '9px 16px' }}>Add</button>
      </form>
      {todos.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>No to-dos for this day yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {todos.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" checked={t.is_done} onChange={() => onToggle(t)} />
              <span style={{ flex: 1, fontSize: 14, textDecoration: t.is_done ? 'line-through' : 'none', color: t.is_done ? 'var(--ink-soft)' : 'var(--ink)' }}>
                {t.content}
              </span>
              <button className="btn-ghost" onClick={() => onDelete(t.id)} style={{ fontSize: 12 }}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WeekView({ start, selectedDate, onSelect, eventsFor, todayIso }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {days.map((d) => {
        const iso = toISO(d)
        const isSelected = iso === toISO(selectedDate)
        const isToday = iso === todayIso
        const dayEvents = eventsFor(d)
        return (
          <button
            key={iso}
            onClick={() => onSelect(d)}
            style={{
              border: isToday ? '2px solid var(--teal-500)' : '2px solid var(--teal-100)',
              background: isSelected ? 'var(--pink-100)' : 'white',
              borderRadius: 14, padding: '10px 14px', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 14, width: '100%',
            }}
          >
            <div style={{ minWidth: 54, textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="display" style={{ fontSize: 18 }}>{d.getDate()}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              {dayEvents.length === 0 ? (
                <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>No events</span>
              ) : (
                <>
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 7, background: ev.color, flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>+{dayEvents.length - 3} more</span>
                  )}
                </>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function MonthView({ cursor, selectedDate, onSelect, eventsFor, todayIso }) {
  const days = monthGrid(cursor)
  const currentMonth = cursor.getMonth()
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((d) => {
          const iso = toISO(d)
          const isSelected = iso === toISO(selectedDate)
          const isToday = iso === todayIso
          const inMonth = d.getMonth() === currentMonth
          const dayEvents = eventsFor(d)
          return (
            <button
              key={iso}
              onClick={() => onSelect(d)}
              style={{
                border: isToday ? '2px solid var(--teal-500)' : '1px solid var(--teal-100)',
                background: isSelected ? 'var(--pink-100)' : 'white',
                borderRadius: 10, minHeight: 78, padding: 6, textAlign: 'left',
                opacity: inMonth ? 1 : 0.4, display: 'flex', flexDirection: 'column', gap: 3,
                overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700 }}>{d.getDate()}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                {dayEvents.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 3, fontSize: 9.5,
                      overflow: 'hidden', width: '100%',
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: 5, background: ev.color, flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</span>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <span style={{ fontSize: 9, color: 'var(--ink-soft)' }}>+{dayEvents.length - 2} more</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
