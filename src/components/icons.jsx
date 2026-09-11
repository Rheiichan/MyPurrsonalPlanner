// Simple monochrome line icons (stroke = currentColor) for the sidebar nav.
// Kept as one file so module icons stay visually consistent.

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconHome(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  )
}
export function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4M16 3v4" />
      <path d="M7.5 13.2h2M11 13.2h2M14.5 13.2h2M7.5 16.6h2M11 16.6h2" />
    </svg>
  )
}
export function IconMood(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <circle cx="12" cy="12" r="8.3" />
      <path d="M9 10.2h.01M15 10.2h.01" strokeWidth="2.6" />
      <path d="M8.6 14.5c1 1.2 2.1 1.8 3.4 1.8s2.4-.6 3.4-1.8" />
    </svg>
  )
}
export function IconFeeling(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <path d="M12 20.2c-4.4-2.9-8-6.2-8-10a4.7 4.7 0 0 1 8-3.3A4.7 4.7 0 0 1 20 10.2c0 3.8-3.6 7.1-8 10Z" />
    </svg>
  )
}
export function IconBudget(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <rect x="3" y="6.5" width="18" height="12" rx="2" />
      <circle cx="12" cy="12.5" r="2.6" />
      <path d="M6.5 6.5V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1.5" />
    </svg>
  )
}
export function IconRecipes(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <path d="M5 11a7 7 0 0 1 14 0Z" />
      <path d="M4 11h16" />
      <path d="M6 14.5 6.8 18a1.5 1.5 0 0 0 1.5 1.2h7.4A1.5 1.5 0 0 0 17.2 18l.8-3.5" />
      <path d="M9.5 5.5c-.6.6-.6 1.4 0 2M12 5c-.6.6-.6 1.4 0 2" />
    </svg>
  )
}
export function IconFitness(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <path d="M6.5 8.5v7M17.5 8.5v7" strokeWidth="2.4" />
      <path d="M3.5 12h3M17.5 12h3" />
      <path d="M6.5 12h11" />
    </svg>
  )
}
export function IconSleep(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <path d="M15 3.5a8.4 8.4 0 1 0 5.5 14.8A8.4 8.4 0 0 1 15 3.5Z" />
    </svg>
  )
}
export function IconSelfcare(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <path d="M12 4v3.4M12 20v-3.4M5.6 6.6l2.4 2.4M16 15l2.4 2.4M4 12h3.4M20 12h-3.4M5.6 17.4 8 15M16 9l2.4-2.4" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}
export function IconGrocery(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <path d="M4 6h2l1.6 9.6a1.6 1.6 0 0 0 1.6 1.4h7.4a1.6 1.6 0 0 0 1.6-1.3L20 9H7" />
      <circle cx="10" cy="20" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="20" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}
export function IconProjects(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <rect x="4" y="4.5" width="16" height="15" rx="2" />
      <path d="M8 9.5h8M8 13h8M8 16.5h5" />
    </svg>
  )
}
export function IconTravel(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <path d="M10.5 20.5 12 17l1.5 3.5M4 14l16-6.6c1-.4 1.9.5 1.5 1.5L14.9 20a.6.6 0 0 1-1.1 0l-2-5-5-2a.6.6 0 0 1 0-1.1L14 8" />
    </svg>
  )
}
export function IconNotebook(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <rect x="5" y="3.5" width="14" height="17" rx="1.8" />
      <path d="M9 3.5v17" />
      <path d="M5 8h1M5 12h1M5 16h1" />
    </svg>
  )
}
export function IconGoals(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <circle cx="12" cy="12" r="8.3" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}
export function IconGratitude(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <rect x="4.5" y="4" width="15" height="16" rx="1.8" />
      <path
        d="M12 15.4c-2.6-1.7-4.3-3.2-4.3-5a2.4 2.4 0 0 1 4.3-1.5A2.4 2.4 0 0 1 16.3 10.4c0 1.8-1.7 3.3-4.3 5Z"
      />
    </svg>
  )
}

// Single-color face whose expression (frown/neutral/smile) reflects a 1-5
// mood level. Used for the mood-meter buttons — same shape throughout,
// only the color (passed via `color`, defaulting to currentColor) changes.
export function IconMoodFace({ level = 3, color, size = 22, ...rest }) {
  const c = color || 'currentColor'
  let mouth
  if (level <= 2) {
    mouth = 'M8.3 15.8c1-1.6 2.3-2.4 3.7-2.4s2.7.8 3.7 2.4' // frown
  } else if (level === 3) {
    mouth = 'M8.3 14.6h7.4' // neutral line
  } else {
    mouth = 'M8.3 13.8c1 1.6 2.3 2.4 3.7 2.4s2.7-.8 3.7-2.4' // smile
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} {...rest}>
      <circle cx="12" cy="12" r="9.3" fill={c} opacity="0.16" />
      <circle cx="12" cy="12" r="9.3" fill="none" stroke={c} strokeWidth="1.8" />
      <circle cx="9" cy="9.8" r="1.05" fill={c} />
      <circle cx="15" cy="9.8" r="1.05" fill={c} />
      <path d={mouth} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
