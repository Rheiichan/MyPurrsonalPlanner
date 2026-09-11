import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { MOOD_LEVELS, moodByLevel } from '../moods'
import { IconMoodFace } from './icons'

function todayISO() {
  return new Date().toLocaleDateString('en-CA')
}

export default function MoodWidget({ compact = false }) {
  const { user } = useAuth()
  const [todayLog, setTodayLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', todayISO())
      .maybeSingle()
      .then(({ data }) => {
        setTodayLog(data)
        setLoading(false)
      })
  }, [user])

  async function logMood(level) {
    setSaving(true)
    const { data } = await supabase
      .from('mood_logs')
      .upsert(
        { user_id: user.id, log_date: todayISO(), mood_level: level },
        { onConflict: 'user_id,log_date' }
      )
      .select()
      .maybeSingle()
    setTodayLog(data)
    setSaving(false)
  }

  const selectedMood = todayLog ? moodByLevel(todayLog.mood_level) : null

  return (
    <div>
      <h3 style={{ fontSize: compact ? 15 : 16, marginBottom: compact ? 8 : 4 }}>Log your mood</h3>
      {!compact && (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12 }}>
          {loading ? ' ' : selectedMood ? `Today: feeling ${selectedMood.label.toLowerCase()}` : 'How are you feeling right now?'}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: compact ? 'flex-start' : 'space-between', gap: 10 }}>
        {MOOD_LEVELS.map((m) => {
          const isSelected = todayLog?.mood_level === m.level
          return (
            <button
              key={m.level}
              onClick={() => logMood(m.level)}
              disabled={saving}
              aria-label={m.label}
              title={m.label}
              style={{
                border: isSelected ? `2px solid ${m.color}` : '2px solid transparent',
                background: 'transparent', borderRadius: 14, padding: 4,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                opacity: todayLog && !isSelected ? 0.5 : 1,
              }}
            >
              <IconMoodFace level={m.level} color={m.color} size={compact ? 26 : 32} />
              {!compact && <span style={{ fontSize: 10, color: 'var(--ink-soft)', fontWeight: 700 }}>{m.label}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
