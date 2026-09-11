import { useParams } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { MODULES } from '../modules'

export default function ComingSoon() {
  const { moduleName } = useParams()
  const mod = MODULES.find((m) => m.path === `/${moduleName}`)
  const Icon = mod?.Icon

  return (
    <PageShell title={mod?.label || 'Coming soon'}>
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: 18, background: 'var(--teal-100)',
            color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          {Icon ? <Icon width="30" height="30" /> : null}
        </div>
        <h2 style={{ fontSize: 22 }}>{mod?.label || 'This module'} is on its way</h2>
        <p style={{ color: 'var(--ink-soft)', marginTop: 8, maxWidth: 360, marginInline: 'auto' }}>
          We're building this one next. Check back soon!
        </p>
      </div>
    </PageShell>
  )
}
