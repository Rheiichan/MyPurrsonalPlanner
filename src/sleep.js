// Duration in hours between a sleep time and a wake time (HH:MM strings),
// assuming the wake time is the next occurrence after the sleep time
// (i.e. handles crossing midnight).
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
