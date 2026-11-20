import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ThemedMascot } from '../themeAssets'
import { PRICE_NOW, PRICE_ORIGINAL, CURRENCY, PAYMENT_URL, REGISTRATION_DAYS } from '../pricing'

const FEATURES = [
  ['Calendar', 'Month & week views, daily agenda, events and to-dos'],
  ['Quick To-Do', 'Tap to finish and it disappears — plus gentle reminders'],
  ['Mood Tracker', 'Log how you feel every day and look back at your history'],
  ['Sleep Tracker', 'Log your sleep, see your average and get friendly feedback'],
  ['How are you feeling?', 'Pick a feeling and get a kind nudge or a matching activity'],
  ['Goals', 'Set goals with target dates and track your progress'],
  ['Gratitude Journal', 'Daily gratitude plus an achievements list'],
  ['Secret Diary', 'A private diary locked behind your own PIN'],
  ['Budgeting', 'Incomes, expenses, savings, allocations and a summary'],
  ['Recipes & Grocery List', 'Save recipes, and diet-based or custom grocery lists'],
  ['Fitness Tracker', 'Targets, BMI and progress toward your goal weight'],
  ['Self-Care Challenge', 'A 30-day challenge with monthly reset and history'],
  ['Project Planner', 'Strategy, checklists and materials with optional costs'],
  ['Travel Planner', 'Day-by-day itineraries and auto-built packing lists'],
  ['Notebooks', '10 customizable notebooks with up to 25 pages each'],
  ['Themes & offline viewing', 'Pastel themes, install on phone or PC, view your data without signal'],
]

export default function PendingActivation() {
  const { profile, signOut, refreshProfile, user } = useAuth()
  const suspended = profile?.account_status === 'suspended'
  const [checking, setChecking] = useState(false)
  const [slots, setSlots] = useState(null)

  useEffect(() => {
    supabase.rpc('get_slots_info').then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data
      if (row) setSlots(row)
    })
  }, [])

  const deadline = profile?.created_at ? new Date(new Date(profile.created_at).getTime() + REGISTRATION_DAYS * 86400000) : null
  const msLeft = deadline ? deadline - new Date() : null
  const soldOut = slots && slots.remaining <= 0

  async function checkAgain() {
    setChecking(true)
    await refreshProfile()
    setChecking(false)
  }

  if (suspended) {
    return (
      <Wrap>
        <div className="card" style={{ textAlign: 'center' }}>
          <ThemedMascot size={64} radius={20} style={{ margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Your access is paused</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
            Your planner access has been paused. If you think this is a mistake, please reach out so we can sort it out.
          </p>
          {profile?.admin_note && <p style={{ fontSize: 13, color: 'var(--pink-700)', marginTop: 10 }}>{profile.admin_note}</p>}
          <button className="btn-secondary" style={{ marginTop: 18 }} onClick={signOut}>Sign out</button>
        </div>
      </Wrap>
    )
  }

  return (
    <Wrap>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <ThemedMascot size={72} radius={22} style={{ margin: '0 auto 12px' }} />
        <h1 style={{ fontSize: 24 }}>Welcome to My Purrsonal Planner!</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '6px 0 0' }}>
          Your account is ready. One last step: get the digital planner to unlock everything.
        </p>
      </div>

      <div className="card" style={{ textAlign: 'center', background: 'var(--pink-100)', marginBottom: 16 }}>
        <span className="pill" style={{ background: 'var(--pink-500)', color: 'white' }}>ON SALE</span>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12 }}>
          <span className="display" style={{ fontSize: 40, color: 'var(--pink-700)' }}>{CURRENCY}{PRICE_NOW}</span>
          <span style={{ fontSize: 18, color: 'var(--ink-soft)', textDecoration: 'line-through' }}>{CURRENCY}{PRICE_ORIGINAL}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '6px 0 16px' }}>
          Digital Purrsonal Planner · one-time payment · lifetime access
        </p>
        {slots && (
          <p style={{ fontSize: 14, fontWeight: 800, margin: '0 0 14px', color: soldOut ? '#c0392b' : 'var(--teal-700)' }}>
            {soldOut ? 'All slots are taken for now' : `🎟 Only ${slots.remaining} of ${slots.max_slots} slots left`}
          </p>
        )}
        {soldOut ? (
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
            We're limiting early access to {slots.max_slots} people. Your account is saved — we'll let you know if a slot opens up.
          </p>
        ) : (
          <>
            <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Buy now — {CURRENCY}{PRICE_NOW}
            </a>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 12, lineHeight: 1.5 }}>
              Please pay using this email so we can match your payment:<br />
              <strong style={{ color: 'var(--ink)' }}>{user?.email}</strong>
            </p>
          </>
        )}
        {deadline && (
          <p style={{ fontSize: 12.5, marginTop: 10, marginBottom: 0, lineHeight: 1.5, color: msLeft < 0 ? '#c0392b' : 'var(--pink-700)', fontWeight: 700 }}>
            {msLeft < 0
              ? 'Your 3-day payment window has passed — your registration may be cancelled soon. Pay now to keep it.'
              : `⏳ Registration is cancelled if payment isn't made within ${REGISTRATION_DAYS} days of signing up — by ${deadline.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}.`}
          </p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16, background: 'var(--teal-100)' }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>What you get</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px 18px' }}>
          {FEATURES.map(([name, desc]) => (
            <div key={name} style={{ fontSize: 13, lineHeight: 1.4 }}>
              <div style={{ fontWeight: 800, color: 'var(--teal-900)' }}>✓ {name}</div>
              <div style={{ color: 'var(--ink-soft)', paddingLeft: 16 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: '0 0 12px' }}>
          Already paid? We confirm payments personally, usually within a day. Once it's verified, tap below and your planner opens.
        </p>
        {profile?.admin_note && <p style={{ fontSize: 13, color: 'var(--pink-700)' }}>{profile.admin_note}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={checkAgain} disabled={checking}>
            {checking ? 'Checking…' : "I've paid — check my access"}
          </button>
          <button className="btn-ghost" onClick={signOut}>Sign out</button>
        </div>
      </div>
    </Wrap>
  )
}

function Wrap({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, var(--teal-100) 0%, var(--cream) 45%, var(--pink-100) 100%)', padding: '28px 16px 48px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>{children}</div>
    </div>
  )
}
