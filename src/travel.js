export const TRIP_TYPES = [
  { key: 'international', label: 'International' },
  { key: 'local', label: 'Local' },
  { key: 'daytime', label: 'Daytime travel only' },
]

// Inclusive day count between two ISO date strings, plus nights (days - 1).
// Daytime trips are always a single day, zero nights.
export function computeTripDuration(startDate, endDate, tripType) {
  if (tripType === 'daytime') return { days: 1, nights: 0 }
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const days = Math.max(1, Math.round((end - start) / 86400000) + 1)
  return { days, nights: Math.max(0, days - 1) }
}

// Returns the list of default packing-list item labels for a trip,
// deduplicated (e.g. "Powerbank" only appears once even though it's
// relevant to both the international/local list and the all-trips list).
export function buildDefaultPackingList(tripType, days, nights) {
  const items = []

  if (tripType === 'international') {
    items.push('Passport', 'Travel Insurance', 'Valid IDs', 'Vouchers', 'Business Documents')
  }

  if (tripType === 'international' || tripType === 'local') {
    items.push(
      `Underwear (${days} pcs)`,
      `Day outfit (${days} pcs)`,
      `Sleepwear (${nights} pcs)`,
      'Shampoo', 'Soap', 'Lotion', 'Wet wipes', 'Powerbank', 'Wall charger',
      'Pillows', 'Blankets', 'Tablets', 'Phones', 'Camera', 'Sunscreen',
    )
  }

  const forAllTrips = ['Medicines', 'Powerbank', 'Cash', 'Cards']
  for (const item of forAllTrips) {
    if (!items.includes(item)) items.push(item)
  }

  return items
}
