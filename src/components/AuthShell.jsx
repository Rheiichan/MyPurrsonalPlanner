import mascot from '../assets/mascot.png'

export default function AuthShell({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, var(--teal-100) 0%, var(--cream) 45%, var(--pink-100) 100%)',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src={mascot}
            alt=""
            aria-hidden
            style={{ width: 72, height: 72, borderRadius: 22, margin: '0 auto 14px', display: 'block' }}
          />
          <h1 style={{ fontSize: 26 }}>My Purrsonal Planner</h1>
          <p style={{ color: 'var(--ink-soft)', margin: '6px 0 0', fontSize: 14 }}>
            your cozy corner for everything
          </p>
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  )
}
