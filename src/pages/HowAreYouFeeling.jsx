import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { FEELINGS } from '../feelings'

export default function HowAreYouFeeling() {
  const [selected, setSelected] = useState(null)

  return (
    <PageShell title="How Are You Feeling?">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>How Are You Feeling?</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20, maxWidth: 480 }}>
        Tap what's closest to how you feel right now, and we'll suggest something to try.
      </p>

      {!selected ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {FEELINGS.map((f) => (
            <button
              key={f.feeling}
              onClick={() => setSelected(f)}
              className="card"
              style={{
                textAlign: 'left', padding: '14px 16px', fontSize: 14, fontWeight: 700,
                background: 'var(--pink-100)', border: '1px solid var(--pink-300)', boxShadow: 'none',
              }}
            >
              {f.feeling}
            </button>
          ))}
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 420, background: 'var(--teal-100)', border: 'none' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 6 }}>You said you're feeling:</p>
          <h2 style={{ fontSize: 19, marginBottom: 18 }}>{selected.feeling}</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 6 }}>Try this:</p>
          <h3 style={{ fontSize: 18, marginBottom: 18 }}>{selected.action}</h3>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {selected.path ? (
              <Link to={selected.path} className="btn-primary" style={{ textDecoration: 'none' }}>
                Take me there
              </Link>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
                No page for this one — just a gentle nudge to try it now 💛
              </p>
            )}
            <button className="btn-ghost" onClick={() => setSelected(null)}>← Pick another feeling</button>
          </div>
        </div>
      )}
    </PageShell>
  )
}
