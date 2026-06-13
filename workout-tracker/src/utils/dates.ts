// Local-timezone date helpers. toISOString() uses UTC, which shifts the
// date around midnight for anyone east of Greenwich — always format dates
// for display/storage keys with these helpers instead.
export function localISODate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Returns the 7 dates of the week containing `from`, as 'YYYY-MM-DD'.
// startDay: 1 = week starts Monday (default), 0 = Sunday.
export function getWeekDates(from: string, startDay: 0 | 1 = 1): string[] {
  const d = new Date(from + 'T12:00:00')
  const offset = startDay === 1 ? (d.getDay() + 6) % 7 : d.getDay()
  const start = new Date(d)
  start.setDate(d.getDate() - offset)
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(start)
    dd.setDate(start.getDate() + i)
    return localISODate(dd)
  })
}

export function getMonthDates(year: number, month: number): string[] {
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => localISODate(new Date(year, month, i + 1)))
}

const DAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export function dowLabel(dow: number) { return DAYS_PT[dow] ?? '' }
export function dowShort(dow: number) { return DAYS_SHORT[dow] ?? '' }
