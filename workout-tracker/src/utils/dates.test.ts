import { describe, it, expect } from 'vitest'
import { localISODate } from './dates'

describe('localISODate', () => {
  it('formats a date as YYYY-MM-DD in local time', () => {
    expect(localISODate(new Date(2026, 5, 12))).toBe('2026-06-12')
  })

  it('pads single-digit month and day', () => {
    expect(localISODate(new Date(2026, 0, 3))).toBe('2026-01-03')
  })

  it('uses the local date even just after local midnight', () => {
    // 00:30 local on June 13 — toISOString() would report June 12 in UTC+ timezones
    expect(localISODate(new Date(2026, 5, 13, 0, 30))).toBe('2026-06-13')
  })
})
