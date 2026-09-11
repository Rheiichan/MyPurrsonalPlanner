import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import SidebarLayout, { MODULES } from '../components/SidebarLayout'

function todayISO() {
  return new Date().toLocaleDateString('en-CA')
}

export default function Hub() {
  const { profile, user } = useAuth()
  const [todayEvents, setTodayEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_date', todayISO())
      .order('event_time', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setTodayEvents(data || [])
        setLoading(false)
      })
  }, [user])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const otherModules = MODULES.filter((m) => m.key !== 'hub')

  return (
    <SidebarLayout title="Home">
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 26 }}>
          {greeting}{profile?.name ? `, ${profile.name}` : ''} 🌷
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 26, background: 'var(--teal-100)', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 16 }}>Today's schedule</h3>
          <Link to="/calendar" style={{ fontSize: 13, fontWeight: 700 }}>Open calendar →</Link>
        </div>
        {loading ? (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Loading…</p>
        ) : todayEvents.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Nothing on the books today — a clean slate 🐾</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayEvents.map((ev) => (
              <div key={ev.id} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}>
                <span style={{ width: 8, height: 8, borderRadius: 8, background: ev.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, minWidth: 64 }}>
                  {ev.event_time ? ev.event_time.slice(0, 5) : 'All day'}
                </span>
                <span>{ev.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <h3 style={{ fontSize: 16, marginBottom: 14 }}>Your planner</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 14,
        }}
      >
        {otherModules.map((m) => (
          <Link
            key={m.key}
            to={m.path}
            className="card"
            style={{
              textDecoration: 'none', display: 'flex', flexDirection: 'column',
              gap: 8, padding: 18, position: 'relative', color: 'var(--ink)',
              opacity: m.available ? 1 : 0.85,
            }}
          >
            {!m.available && (
              <span className="pill" style={{ position: 'absolute', top: 12, right: 12, background: 'var(--pink-100)', color: 'var(--pink-700)' }}>
                Soon
              </span>
            )}
            <span style={{ fontSize: 26 }}>{m.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</span>
          </Link>
        ))}
      </div>
    </SidebarLayout>
  )
}
