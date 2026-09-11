export const MOOD_LEVELS = [
  { level: 1, label: 'Awful', color: '#E2574C', message: "That's okay — be gentle with yourself today." },
  { level: 2, label: 'Low', color: '#F0925A', message: 'Rough moments pass. Take it slow today.' },
  { level: 3, label: 'Okay', color: '#F2C14E', message: "A steady day — you're doing okay." },
  { level: 4, label: 'Good', color: '#8DC63F', message: 'Nice! Keep that good energy going.' },
  { level: 5, label: 'Great', color: '#4CAF6D', message: "You're doing great today!" },
]

export function moodByLevel(level) {
  return MOOD_LEVELS.find((m) => m.level === level)
}
