import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { applyTheme } from '../themes'

export default function ThemeApplier() {
  const { profile } = useAuth()

  useEffect(() => {
    applyTheme(profile?.theme)
  }, [profile?.theme])

  return null
}
