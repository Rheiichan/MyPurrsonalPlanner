// Duration in hours between a sleep time and a wake time (HH:MM strings),
// assuming the wake time is the next occurrence after the sleep time
// (i.e. handles crossing midnight).
// Convert a 24-hour "HH:MM" string to { hour12, minute, meridiem } for display.
export function to12Hour(time24) {
  const [h, m] = time24.split(':').map(Number)
  const meridiem = h >= 12 ? 'PM' : 'AM'
  let hour12 = h % 12
  if (hour12 === 0) hour12 = 12
  return { hour12, minute: m, meridiem }
}

// Convert 12-hour parts back to a 24-hour "HH:MM" string for storage.
export function to24Hour(hour12, minute, meridiem) {
  let h = hour12 % 12
  if (meridiem === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function computeSleepHours(sleepTime, wakeTime) {
  const [sh, sm] = sleepTime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let startMin = sh * 60 + sm
  let endMin = wh * 60 + wm
  if (endMin <= startMin) endMin += 24 * 60
  return Math.round(((endMin - startMin) / 60) * 100) / 100
}

export function sleepFeedback(avgHours) {
  if (avgHours == null) return null
  if (avgHours < 6) {
    return { label: 'Needs improvement', message: 'Try to get a bit more rest — aim for 7-9 hours.', color: '#E2574C' }
  }
  if (avgHours < 7) {
    return { label: 'Getting there', message: 'Close! A little more sleep would help.', color: '#F0925A' }
  }
  if (avgHours <= 9) {
    return { label: 'Doing great', message: "You're getting a healthy amount of sleep. Keep it up!", color: '#4CAF6D' }
  }
  return { label: 'Plenty of rest', message: "That's a lot of sleep — make sure you're feeling rested, not just tired.", color: '#8DC63F' }
}
