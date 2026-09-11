import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { hashPin } from '../pinHash'
import PageShell from '../components/PageShell'
import { IconLock } from '../components/icons'

function PinDots({ value }) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 18 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '2px solid var(--teal-500)',
            background: value.length > i ? 'var(--teal-500)' : 'transparent',
          }}
        />
      ))}
    </div>
  )
}

function PinPad({ value, onChange, onSubmit }) {
  function press(d) {
    if (value.length >= 4) return
    const next = value + d
    onChange(next)
    if (next.length === 4) onSubmit(next)
  }
  function backspace() {
    onChange(value.slice(0, -1))
  }
  return (
    <div style={{ maxWidth: 220, margin: '0 auto' }}>
      <PinDots value={value} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} onClick={() => press(d)} className="btn-secondary" style={{ padding: '14px 0', fontSize: 18 }}>
            {d}
          </button>
        ))}
        <div />
        <button onClick={() => press('0')} className="btn-secondary" style={{ padding: '14px 0', fontSize: 18 }}>0</button>
        <button onClick={backspace} className="btn-ghost" style={{ fontSize: 14 }}>⌫</button>
      </div>
    </div>
  )
}

export default function SecretDiary() {
  const { user } = useAuth()
  const [checking, setChecking] = useState(true)
  const [hasPin, setHasPin] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')

  // Setup flow
  const [setupStep, setSetupStep] = useState('choose') // 'choose' | 'confirm'
  const [chosenPin, setChosenPin] = useState('')
  const [pinInput, setPinInput] = useState('')

  useEffect(() => {
    if (!user) return
    supabase
      .from('diary_pins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setHasPin(!!data)
        setChecking(false)
      })
  }, [user])

  async function handleSetupSubmit(pin) {
    if (setupStep === 'choose') {
      setChosenPin(pin)
      setSetupStep('confirm')
      setPinInput('')
      return
    }
    // confirm step
    if (pin !== chosenPin) {
      setError("PINs didn't match — let's try again.")
      setSetupStep('choose')
      setChosenPin('')
      setPinInput('')
      return
    }
    const pin_hash = await hashPin(pin)
    await supabase.from('diary_pins').insert({ user_id: user.id, pin_hash })
    setHasPin(true)
    setUnlocked(true)
  }

  async function handleUnlockSubmit(pin) {
    const pin_hash = await hashPin(pin)
    const { data } = await supabase
      .from('diary_pins')
      .select('pin_hash')
      .eq('user_id', user.id)
      .maybeSingle()
    if (data?.pin_hash === pin_hash) {
      setUnlocked(true)
      setError('')
    } else {
      setError('Incorrect PIN. Try again.')
      setPinInput('')
    }
  }

  if (checking) {
    return (
      <PageShell title="Secret Diary">
        <p style={{ color: 'var(--ink-soft)' }}>Loading…</p>
      </PageShell>
    )
  }

  if (!unlocked) {
    return (
      <PageShell title="Secret Diary">
        <div style={{ textAlign: 'center', maxWidth: 320, margin: '40px auto 0' }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 18, background: 'var(--teal-100)', color: 'var(--teal-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}
          >
            <IconLock width="26" height="26" />
          </div>

          {!hasPin ? (
            <>
              <h2 style={{ fontSize: 19, marginBottom: 4 }}>
                {setupStep === 'choose' ? 'Set up your diary PIN' : 'Confirm your PIN'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>
                {setupStep === 'choose'
                  ? 'Choose a 4-digit PIN to keep your diary private.'
                  : 'Enter it once more to confirm.'}
              </p>
              {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <PinPad value={pinInput} onChange={setPinInput} onSubmit={handleSetupSubmit} />
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 19, marginBottom: 4 }}>Enter your PIN</h2>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>
                Forgot it? Ask an admin to reset it to 0000.
              </p>
              {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <PinPad value={pinInput} onChange={setPinInput} onSubmit={handleUnlockSubmit} />
            </>
          )}
        </div>
      </PageShell>
    )
  }

  return <DiaryEntries user={user} />
}

function ChangePinFlow({ user, onDone, onCancel }) {
  const [step, setStep] = useState('current') // 'current' | 'new' | 'confirm'
  const [newPin, setNewPin] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(pin) {
    if (step === 'current') {
      const pin_hash = await hashPin(pin)
      const { data } = await supabase
        .from('diary_pins')
        .select('pin_hash')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data?.pin_hash !== pin_hash) {
        setError('That PIN is incorrect.')
        setPinInput('')
        return
      }
      setError('')
      setStep('new')
      setPinInput('')
      return
    }
    if (step === 'new') {
      setNewPin(pin)
      setStep('confirm')
      setPinInput('')
      return
    }
    // confirm
    if (pin !== newPin) {
      setError("PINs didn't match — let's try again.")
      setStep('new')
      setNewPin('')
      setPinInput('')
      return
    }
    const pin_hash = await hashPin(pin)
    await supabase.from('diary_pins').update({ pin_hash }).eq('user_id', user.id)
    onDone()
  }

  const titles = {
    current: 'Enter your current PIN',
    new: 'Choose a new PIN',
    confirm: 'Confirm your new PIN',
  }

  return (
    <div className="card" style={{ maxWidth: 320, margin: '0 auto 20px', textAlign: 'center' }}>
      <h3 style={{ fontSize: 17, marginBottom: 16 }}>{titles[step]}</h3>
      {error && <p style={{ color: 'var(--pink-700)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      <PinPad value={pinInput} onChange={setPinInput} onSubmit={handleSubmit} />
      <button className="btn-ghost" onClick={onCancel} style={{ marginTop: 14 }}>Cancel</button>
    </div>
  )
}

function formatDateTime(iso) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function DiaryEntries({ user }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [changingPin, setChangingPin] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
    setEntries(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addEntry(e) {
    e.preventDefault()
    if (!content.trim()) return
    await supabase.from('diary_entries').insert({ user_id: user.id, content: content.trim() })
    setContent('')
    load()
  }

  async function remove(id) {
    await supabase.from('diary_entries').delete().eq('id', id)
    load()
  }

  function toggleExpand(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <PageShell title="Secret Diary">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 22 }}>Secret Diary</h1>
        {!changingPin && (
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setChangingPin(true)}>
            Change PIN
          </button>
        )}
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
        A private space for anything you don't want to put anywhere else.
      </p>

      {changingPin && (
        <ChangePinFlow
          user={user}
          onCancel={() => setChangingPin(false)}
          onDone={() => setChangingPin(false)}
        />
      )}

      <div className="card notebook-card" style={{ marginBottom: 20 }}>
        <form onSubmit={addEntry}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write whatever's on your mind…"
            rows={4}
            className="notebook-font"
            style={{ width: '100%', padding: '10px 12px 10px 6px', background: 'transparent', border: 'none', outline: 'none', fontSize: 18, resize: 'vertical', marginBottom: 10, lineHeight: '28px' }}
          />
          <button className="btn-primary">Save entry</button>
        </form>
      </div>

      {loading ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Loading…</p>
      ) : entries.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 13 }}>Nothing written yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entries.map((e) => {
            const isExpanded = expandedIds.has(e.id)
            return (
              <div
                key={e.id}
                className="card notebook-card"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleExpand(e.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingLeft: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                    {formatDateTime(e.created_at)}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--teal-700)', fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-body)' }}>
                    {isExpanded ? 'Collapse ▲' : 'Read ▾'}
                  </span>
                </div>
                <div
                  className="notebook-font"
                  style={{
                    fontSize: 18, marginTop: 8, paddingLeft: 6, lineHeight: '28px',
                    whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap',
                    overflow: 'hidden', textOverflow: isExpanded ? 'clip' : 'ellipsis',
                  }}
                >
                  {e.content}
                </div>
                {isExpanded && (
                  <div style={{ textAlign: 'right', marginTop: 10 }}>
                    <button
                      className="btn-ghost"
                      onClick={(ev) => { ev.stopPropagation(); remove(e.id) }}
                      style={{ fontSize: 12 }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .notebook-card {
          position: relative;
          background-color: #FFFDF6;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0px, transparent 27px, rgba(79,189,176,0.28) 28px
          );
          background-position: 0 4px;
          padding: 16px 16px 16px 38px;
          border: 1px solid #F0E6D2;
        }
        .notebook-card::before {
          content: '';
          position: absolute;
          left: 26px;
          top: 0;
          bottom: 0;
          width: 1.5px;
          background: rgba(255, 143, 163, 0.55);
        }
        .notebook-card::after {
          content: '';
          position: absolute;
          left: 9px;
          top: 14px;
          bottom: 14px;
          width: 7px;
          background-image: radial-gradient(circle, #FFFDF6 3.2px, transparent 3.4px);
          background-size: 7px 26px;
          background-repeat: repeat-y;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.05) inset;
        }
        .notebook-font {
          font-family: 'Patrick Hand', cursive;
        }
      `}</style>
    </PageShell>
  )
}
