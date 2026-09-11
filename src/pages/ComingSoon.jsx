import { useParams } from 'react-router-dom'
import SidebarLayout, { MODULES } from '../components/SidebarLayout'

export default function ComingSoon() {
  const { moduleName } = useParams()
  const mod = MODULES.find((m) => m.path === `/${moduleName}`)

  return (
    <SidebarLayout title={mod?.label || 'Coming soon'}>
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{mod?.icon || '🧵'}</div>
        <h2 style={{ fontSize: 22 }}>{mod?.label || 'This module'} is on its way</h2>
        <p style={{ color: 'var(--ink-soft)', marginTop: 8, maxWidth: 360, marginInline: 'auto' }}>
          We're building this one next. Check back soon!
        </p>
      </div>
    </SidebarLayout>
  )
}
