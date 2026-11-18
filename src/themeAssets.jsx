import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { getTheme } from './themes'
import defaultMascot from './assets/mascot.png'
import { IconMoodFace } from './components/icons'

export function useTheme() {
  const { profile } = useAuth()
  return getTheme(profile?.theme)
}

// Picture that quietly disappears (or swaps to `fallback`) if the file
// hasn't been added yet, so half-finished themes never show broken images.
function SafeImg({ src, fallback, ...rest }) {
  const [failed, setFailed] = useState(null)
  if (!src || failed === src) return fallback ?? null
  return <img src={src} onError={() => setFailed(src)} {...rest} />
}

export function ThemedMascot({ size = 72, radius = 22, style }) {
  const theme = useTheme()
  const base = { width: size, height: size, borderRadius: radius, objectFit: 'cover', ...style }
  return (
    <SafeImg
      src={theme.images?.mascot}
      alt="" aria-hidden style={base}
      fallback={<img src={defaultMascot} alt="" aria-hidden style={base} />}
    />
  )
}

export function MoodFace({ level, color, size = 32 }) {
  const theme = useTheme()
  return (
    <SafeImg
      src={theme.images?.moods?.[level]}
      alt="" aria-hidden
      style={{ width: size * 1.5, height: size * 1.5, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
      fallback={<IconMoodFace level={level} color={color} size={size} />}
    />
  )
}

// Banner for the current page, if the active theme provides one.
export function PageBanner() {
  const theme = useTheme()
  const { pathname } = useLocation()
  const route = pathname.split('/')[1] || 'hub'
  const src = theme.images?.banners?.[route]
  return (
    <SafeImg
      key={src}
      src={src} alt="" aria-hidden
      style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 20, display: 'block' }}
    />
  )
}
