// A theme can change four things:
//   vars    - the color "roles" (--teal-* primary, --pink-* accent, --cream page bg)
//   font    - optional body/display font stacks
//   shape   - optional corner radii (sharp for typewriter, round for cute)
//   images  - optional picture slots: mascot, mood faces 1-5, page banners.
// Anything a theme leaves out falls back to the default look, so a theme can
// be as light (just colors) or as rich (full photo set) as you like.
//
// Pictures live in public/themes/<theme-key>/ and are referenced as
// /themes/<theme-key>/<file>. If a file is missing the app silently falls
// back to the default drawing, so you can add images a few at a time.
const img = (key, file) => `/themes/${key}/${file}`

function photoSet(key) {
  return {
    mascot: img(key, 'mascot.png'),
    moods: { 1: img(key, 'mood-1.png'), 2: img(key, 'mood-2.png'), 3: img(key, 'mood-3.png'), 4: img(key, 'mood-4.png'), 5: img(key, 'mood-5.png') },
    // route path -> banner picture shown at the top of that page
    banners: Object.fromEntries(
      ['hub', 'calendar', 'mood', 'sleep', 'feeling', 'goals', 'gratitude', 'secret-diary', 'selfcare', 'recipes', 'fitness', 'grocery', 'notebooks', 'projects', 'travel', 'budget', 'profile']
        .map((r) => [r, img(key, `banner-${r}.png`)])
    ),
  }
}

export const DEFAULT_FONTS = {
  display: "'Baloo 2', system-ui, sans-serif",
  body: "'Nunito', system-ui, sans-serif",
}
export const DEFAULT_SHAPE = { sm: '10px', md: '16px', lg: '24px' }

export const THEMES = {
  'pink-teal': {
    label: 'Pink & Teal',
    swatch: ['#FF8FA3', '#4FBDB0'],
    vars: {
      '--teal-900': '#1F3A38', '--teal-700': '#2E7A70', '--teal-500': '#4FBDB0', '--teal-300': '#9BDCD2', '--teal-100': '#E4F7F3',
      '--pink-700': '#E8617A', '--pink-500': '#FF8FA3', '--pink-300': '#FFC2CE', '--pink-100': '#FFEEF2',
      '--cream': '#FFF8F3',
    },
  },
  'gray-white': {
    label: 'Gray & White',
    swatch: ['#8A9096', '#FFFFFF'],
    vars: {
      '--teal-900': '#2E3236', '--teal-700': '#565C63', '--teal-500': '#8A9096', '--teal-300': '#D4D7DA', '--teal-100': '#F4F5F6',
      '--pink-700': '#6B7280', '--pink-500': '#9CA3AF', '--pink-300': '#E5E7EB', '--pink-100': '#FFFFFF',
      '--cream': '#FAFAFA',
    },
  },
  'blue-pink': {
    label: 'Blue & Pink',
    swatch: ['#5B9BD5', '#FF8FA3'],
    vars: {
      '--teal-900': '#1E3A5F', '--teal-700': '#2F6690', '--teal-500': '#5B9BD5', '--teal-300': '#B8D9F0', '--teal-100': '#EAF4FC',
      '--pink-700': '#E8617A', '--pink-500': '#FF8FA3', '--pink-300': '#FFC2CE', '--pink-100': '#FFEEF2',
      '--cream': '#F5FAFF',
    },
  },
  'yellow-pink': {
    label: 'Yellow & Pink',
    swatch: ['#F2C14E', '#FF8FA3'],
    vars: {
      '--teal-900': '#7A5C00', '--teal-700': '#A67F00', '--teal-500': '#F2C14E', '--teal-300': '#FBE4A8', '--teal-100': '#FFF8E5',
      '--pink-700': '#E8617A', '--pink-500': '#FF8FA3', '--pink-300': '#FFC2CE', '--pink-100': '#FFEEF2',
      '--cream': '#FFFCF2',
    },
  },
  'blue-gray': {
    label: 'Blue & Gray',
    swatch: ['#5B9BD5', '#8A9096'],
    vars: {
      '--teal-900': '#1E3A5F', '--teal-700': '#2F6690', '--teal-500': '#5B9BD5', '--teal-300': '#B8D9F0', '--teal-100': '#EAF4FC',
      '--pink-700': '#5B6268', '--pink-500': '#8B939A', '--pink-300': '#D4D7DA', '--pink-100': '#F4F5F6',
      '--cream': '#F7F9FA',
    },
  },
  'mono-typewriter': {
    label: 'Black & White Typewriter',
    swatch: ['#111111', '#FFFFFF'],
    font: {
      display: "'Special Elite', 'Courier Prime', 'Courier New', monospace",
      body: "'Courier Prime', 'Courier New', monospace",
    },
    shape: { sm: '2px', md: '3px', lg: '4px' },
    vars: {
      '--teal-900': '#111111', '--teal-700': '#1A1A1A', '--teal-500': '#444444', '--teal-300': '#BBBBBB', '--teal-100': '#EFEFEF',
      '--pink-700': '#333333', '--pink-500': '#777777', '--pink-300': '#D0D0D0', '--pink-100': '#F7F7F7',
      '--cream': '#FFFFFF', '--ink': '#111111', '--ink-soft': '#555555',
    },
  },
  'miku': {
    label: 'Miku Teal',
    swatch: ['#39C5BB', '#FF4F9A'],
    vars: {
      '--teal-900': '#0B3B3C', '--teal-700': '#139A93', '--teal-500': '#39C5BB', '--teal-300': '#A6EAE4', '--teal-100': '#E3FAF8',
      '--pink-700': '#E0357F', '--pink-500': '#FF4F9A', '--pink-300': '#FFB3D3', '--pink-100': '#FFEAF3',
      '--cream': '#F3FCFB',
    },
    images: photoSet('miku'),
  },
  'chiikawa': {
    label: 'Chiikawa',
    swatch: ['#9FD0EE', '#F7B6C6', '#FFE8A3'],
    vars: {
      '--teal-900': '#3F5A6B', '--teal-700': '#6AA6CB', '--teal-500': '#9FD0EE', '--teal-300': '#CFE8F7', '--teal-100': '#EEF7FD',
      '--pink-700': '#E58AA0', '--pink-500': '#F7B6C6', '--pink-300': '#FBD7E0', '--pink-100': '#FFF0F4',
      '--cream': '#FFF8D9', '--ink': '#4A4A55', '--ink-soft': '#85858F',
    },
    shape: { sm: '14px', md: '22px', lg: '30px' },
    images: photoSet('chiikawa'),
  },
}

export const DEFAULT_THEME = 'pink-teal'

export function getTheme(themeKey) {
  return THEMES[themeKey] || THEMES[DEFAULT_THEME]
}

const ALL_VAR_KEYS = ['--teal-900', '--teal-700', '--teal-500', '--teal-300', '--teal-100', '--pink-700', '--pink-500', '--pink-300', '--pink-100', '--cream', '--ink', '--ink-soft']

export function applyTheme(themeKey) {
  const theme = getTheme(themeKey)
  const root = document.documentElement
  // Reset optional roles first so switching away from a theme that set
  // --ink (etc.) doesn't leave its values behind.
  for (const k of ALL_VAR_KEYS) root.style.removeProperty(k)
  for (const [prop, value] of Object.entries(theme.vars)) root.style.setProperty(prop, value)
  const font = { ...DEFAULT_FONTS, ...(theme.font || {}) }
  const shape = { ...DEFAULT_SHAPE, ...(theme.shape || {}) }
  root.style.setProperty('--font-display', font.display)
  root.style.setProperty('--font-body', font.body)
  root.style.setProperty('--radius-sm', shape.sm)
  root.style.setProperty('--radius-md', shape.md)
  root.style.setProperty('--radius-lg', shape.lg)
  root.dataset.theme = themeKey && THEMES[themeKey] ? themeKey : DEFAULT_THEME
}
