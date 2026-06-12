// Local-timezone date helpers. toISOString() uses UTC, which shifts the
// date around midnight for anyone east of Greenwich — always format dates
// for display/storage keys with these helpers instead.
export function localISODate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
