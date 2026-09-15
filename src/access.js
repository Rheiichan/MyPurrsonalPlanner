// Three tiers:
// - 'full'    — everything unlocked (active, or trial still running, or admin)
// - 'locked'  — trial ran out; only Hub, Calendar, Quick To-Do (on Hub), and
//               My Profile stay reachable
// - 'blocked' — suspended, or the old pre-trial pending_payment state;
//               same full block as before (the /pending screen)
export function getAccessTier(profile, isAdmin) {
  if (isAdmin) return 'full'
  if (!profile) return 'full' // still loading elsewhere; don't flash a lock screen
  if (profile.account_status === 'suspended') return 'blocked'
  if (profile.account_status === 'active') return 'full'
  if (profile.account_status === 'trial') {
    const ends = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
    if (!ends || new Date() < ends) return 'full'
    return 'locked'
  }
  // legacy 'pending_payment' or anything unrecognized
  return 'blocked'
}

export function daysLeftInTrial(profile) {
  if (!profile?.trial_ends_at) return null
  const ms = new Date(profile.trial_ends_at) - new Date()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}
