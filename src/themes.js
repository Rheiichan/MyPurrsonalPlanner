// Each theme redefines the same CSS variable "roles" the app already
// uses everywhere (--teal-* as the primary color, --pink-* as the
// accent, --cream as the page background) — so switching themes doesn't
// need any component changes, just different values for these variables.
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
}

export const DEFAULT_THEME = 'pink-teal'

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES[DEFAULT_THEME]
  const root = document.documentElement
  for (const [prop, value] of Object.entries(theme.vars)) {
    root.style.setProperty(prop, value)
  }
}
