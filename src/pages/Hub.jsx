import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { MODULES } from '../modules'
import mascot from '../assets/mascot.png'
import { IconCalendar } from '../components/icons'
import MoodWidget from '../components/MoodWidget'
import SleepWidget from '../components/SleepWidget'

function todayISO() {
  return new Date().toLocaleDateString('en-CA')
}

export default function Hub() {
  const { profile, user, signOut, isAdmin } = useAuth()
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, padding: '16px 24px 0' }}>
        {isAdmin && (
          <Link to="/admin" className="btn-ghost" style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-700)' }}>
            Admin panel
          </Link>
        )}
        <button onClick={signOut} className="btn-ghost" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
          Sign out
        </button>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '10px 24px 60px', textAlign: 'center' }}>
        <img src={mascot} alt="" aria-hidden style={{ width: 72, height: 72, borderRadius: 22, margin: '0 auto 14px' }} />
        <h1 style={{ fontSize: 26 }}>
          {greeting}{profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 4, marginBottom: 26 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        <div className="card" style={{ marginBottom: 30, background: 'var(--teal-100)', border: 'none', textAlign: 'left' }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Today's schedule</h3>
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
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link
              to="/calendar"
              className="btn-secondary"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13 }}
            >
              <IconCalendar /> View my Calendar
            </Link>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 16, marginBottom: 30,
          }}
        >
          <div className="card" style={{ background: 'var(--pink-100)', border: 'none' }}>
            <MoodWidget compact />
          </div>
          <div className="card" style={{ background: 'var(--pink-100)', border: 'none' }}>
            <SleepWidget compact />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12,
          }}
          className="module-grid"
        >
          {MODULES.map((m) => {
            const Icon = m.Icon
            return (
              <Link
                key={m.key}
                to={m.path}
                className="card module-btn"
                style={{
                  textDecoration: 'none', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center', gap: 8, padding: '20px 12px',
                  position: 'relative', color: 'var(--ink)', background: 'var(--pink-100)',
                  boxShadow: 'none', border: '1px solid var(--pink-300)',
                  opacity: m.available ? 1 : 0.9,
                }}
              >
                {!m.available && (
                  <span className="pill" style={{ position: 'absolute', top: 10, right: 10, background: 'white', color: 'var(--pink-700)' }}>
                    Soon
                  </span>
                )}
                <div
                  style={{
                    width: 42, height: 42, borderRadius: 14, background: 'white',
                    color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon width="21" height="21" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{m.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 420px) {
          .module-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
