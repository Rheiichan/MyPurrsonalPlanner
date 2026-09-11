export const MOOD_LEVELS = [
  { level: 1, label: 'Awful', color: '#E2574C' },
  { level: 2, label: 'Low', color: '#F0925A' },
  { level: 3, label: 'Okay', color: '#F2C14E' },
  { level: 4, label: 'Good', color: '#8DC63F' },
  { level: 5, label: 'Great', color: '#4CAF6D' },
]

export function moodByLevel(level) {
  return MOOD_LEVELS.find((m) => m.level === level)
}
