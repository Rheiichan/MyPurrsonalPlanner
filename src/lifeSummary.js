import { sleepFeedback } from './sleep'

const MOOD_PHRASES = {
  1: 'having a rough patch',
  2: 'feeling a bit low lately',
  3: 'feeling okay lately',
  4: 'mostly happy',
  5: 'feeling great lately',
}

const SLEEP_PHRASES = {
  'Needs improvement': 'not getting enough sleep',
  'Getting there': 'sleep could use a bit more rest',
  'Doing great': 'having good sleep',
  'Plenty of rest': 'getting plenty of rest',
}

export function buildLifeSummary({ moodLogs, sleepLogs, dietCategory }) {
  const parts = []

  if (moodLogs && moodLogs.length > 0) {
    const avg = moodLogs.reduce((sum, m) => sum + m.mood_level, 0) / moodLogs.length
    const level = Math.round(avg)
    if (MOOD_PHRASES[level]) parts.push(`you're ${MOOD_PHRASES[level]}`)
  }

  if (sleepLogs && sleepLogs.length > 0) {
    const avgHours = sleepLogs.reduce((sum, s) => sum + Number(s.duration_hours), 0) / sleepLogs.length
    const feedback = sleepFeedback(Math.round(avgHours * 10) / 10)
    if (feedback && SLEEP_PHRASES[feedback.label]) parts.push(`you're ${SLEEP_PHRASES[feedback.label]}`)
  }

  if (dietCategory) {
    parts.push(`you're in ${dietCategory} diet mode`)
  }

  if (parts.length === 0) return null
  if (parts.length === 1) return capitalize(parts[0]) + '.'
  if (parts.length === 2) return capitalize(`${parts[0]}, and ${parts[1]}`) + '.'
  return capitalize(`${parts[0]}, ${parts[1]}, and ${parts[2]}`) + '.'
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
