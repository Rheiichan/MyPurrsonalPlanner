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
  const themed = { ...base, objectFit: 'contain', background: 'white', padding: Math.round(size * 0.08) }
  return (
    <SafeImg
      src={theme.images?.mascot}
      alt="" aria-hidden style={themed}
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
      style={{ width: size * 1.5, height: size * 1.5, objectFit: 'contain' }}
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

// Hub menu button icon: the theme's own picture for that module if it
// has one, otherwise the normal line icon.
export function MenuIcon({ moduleKey, Icon }) {
  const theme = useTheme()
  return (
    <SafeImg
      src={theme.images?.menu?.[moduleKey]}
      alt="" aria-hidden
      style={{ width: 30, height: 30, objectFit: 'contain' }}
      fallback={<Icon width="21" height="21" />}
    />
  )
}

// The page's own menu picture (same one used on the Hub button), shown
// at the top of that page so each page carries its icon.
export function PageIcon() {
  const theme = useTheme()
  const { pathname } = useLocation()
  const route = pathname.split('/')[1]
  const src = theme.images?.menu?.[route]
  return (
    <SafeImg
      key={src}
      src={src} alt="" aria-hidden
      style={{ width: 72, height: 72, objectFit: 'contain', display: 'block', margin: '0 auto 14px' }}
    />
  )
}
