import { useOnlineStatus } from '../useOnlineStatus'

export default function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div
      style={{
        background: '#F2C14E', color: '#4A3B0A', textAlign: 'center',
        fontSize: 12.5, fontWeight: 700, padding: '7px 12px', position: 'relative', zIndex: 200,
      }}
    >
      You're offline — showing the last data that was loaded. New entries won't save until you're back online.
    </div>
  )
}
