export const CHALLENGE_DAYS = [
  'Set a personal goal for the month',
  'Practice deep breathing or meditation for 10 minutes',
  "Write a list of 10 things you're grateful for",
  'Take a walk outside',
  'Declutter a room or workspace',
  'Call or text a friend to catch up',
  'Cook a healthy meal',
  'Practice yoga or gentle stretching',
  'Write a positive affirmation and repeat it throughout the day',
  'Create a relaxing bedtime routine',
  'Journal about your thoughts and feelings',
  'Set aside time for your favorite hobby',
  'Give yourself a compliment',
  'Unplug from technology for an hour',
  'Listen to your favorite music or a calming playlist',
  'Practice mindfulness while doing everyday tasks',
  'Go to new places with loved ones',
  'Read a book or watch a movie that inspires you',
  'Explore a new relaxation method, like progressive muscle relaxation',
  'Take a power nap or restorative break',
  'Create a vision board or list of personal goals',
  'Volunteer or perform a random act of kindness',
  'Treat yourself to a small indulgence',
  'Reflect on your accomplishments and growth',
  'Connect with nature by visiting a park, beach, or forest',
  'Write a letter to your future self',
  'Set boundaries to protect your energy and time',
  'Establish a morning routine that energizes you',
  'Practice self-compassion and forgive yourself for past mistakes',
  'Review your progress and celebrate your achievements',
]

// Soft pastel palette the day cards cycle through, matching the
// scrapbook-style variety of the original paper challenge.
export const CHALLENGE_COLORS = [
  '#FFD9E0', // pink
  '#FFE9B0', // yellow
  '#E3D6F5', // lavender
  '#BDEDEA', // aqua
  '#FFD9E0', // pink (repeat to fill 5-wide rows like the original)
]

export function currentYearMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatYearMonth(ym) {
  const [year, month] = ym.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
