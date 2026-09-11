import { to12Hour, to24Hour } from '../sleep'

const selectStyle = {
  padding: '9px 8px', borderRadius: 10, border: '2px solid var(--teal-100)', background: 'white', fontSize: 15,
}

export default function TimeInput12({ value, onChange }) {
  const { hour12, minute, meridiem } = to12Hour(value)

  function update(nextHour, nextMinute, nextMeridiem) {
    onChange(to24Hour(nextHour, nextMinute, nextMeridiem))
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <select
        value={hour12}
        onChange={(e) => update(Number(e.target.value), minute, meridiem)}
        style={selectStyle}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span>:</span>
      <select
        value={minute}
        onChange={(e) => update(hour12, Number(e.target.value), meridiem)}
        style={selectStyle}
      >
        {Array.from({ length: 60 }, (_, i) => i).map((m) => (
          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
        ))}
      </select>
      <select
        value={meridiem}
        onChange={(e) => update(hour12, minute, e.target.value)}
        style={selectStyle}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}
