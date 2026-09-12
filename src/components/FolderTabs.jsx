export default function FolderTabs({ tabs, active, onChange, size = 'md', scrollable = false, children }) {
  const padding = size === 'sm' ? '8px 14px' : '11px 18px'
  const fontSize = size === 'sm' ? 12 : 13

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, overflowX: scrollable ? 'auto' : 'visible', flexWrap: scrollable ? 'nowrap' : 'wrap' }}>
        {tabs.map((t) => {
          const isActive = active === t.key
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              style={{
                padding,
                borderRadius: '12px 12px 0 0',
                border: '1px solid var(--pink-300)',
                borderBottom: isActive ? '1px solid white' : '1px solid var(--pink-300)',
                background: isActive ? 'white' : 'var(--pink-100)',
                color: isActive ? 'var(--ink)' : 'var(--pink-700)',
                fontWeight: 700, fontSize,
                position: 'relative', top: 1, zIndex: isActive ? 2 : 1,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div
        style={{
          background: 'white', border: '1px solid var(--pink-300)', borderRadius: '0 12px 12px 12px',
          padding: 20, position: 'relative', zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  )
}
