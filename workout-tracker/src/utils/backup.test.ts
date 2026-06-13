// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { buildBackup, validateBackup, restoreBackup } from './backup'
import { STORAGE_KEYS, loadJSON, saveJSON } from './storage'

beforeEach(() => localStorage.clear())

describe('buildBackup', () => {
  it('includes stored data and skips empty keys', () => {
    saveJSON(STORAGE_KEYS.workoutPlans, [{ id: 'p1' }])
    const backup = buildBackup()
    expect(backup.app).toBe('new-life')
    expect(backup.version).toBe(1)
    expect(backup.data[STORAGE_KEYS.workoutPlans]).toEqual([{ id: 'p1' }])
    expect(STORAGE_KEYS.nutritionLogs in backup.data).toBe(false)
  })

  it('never includes the transient active workout', () => {
    saveJSON(STORAGE_KEYS.activeWorkout, { log: {} })
    expect(STORAGE_KEYS.activeWorkout in buildBackup().data).toBe(false)
  })
})

describe('validateBackup', () => {
  it('accepts a backup produced by buildBackup', () => {
    saveJSON(STORAGE_KEYS.profile, { week_start_day: 1 })
    expect(validateBackup(JSON.parse(JSON.stringify(buildBackup())))).toBe(true)
  })

  it('rejects wrong app, version or unknown keys', () => {
    expect(validateBackup({ app: 'other', version: 1, data: {} })).toBe(false)
    expect(validateBackup({ app: 'new-life', version: 2, data: {} })).toBe(false)
    expect(validateBackup({ app: 'new-life', version: 1, data: { evil_key: [] } })).toBe(false)
    expect(validateBackup(null)).toBe(false)
  })
})

describe('restoreBackup', () => {
  it('round-trips data through export and import', () => {
    saveJSON(STORAGE_KEYS.workoutLogs, [{ id: 'l1' }])
    saveJSON(STORAGE_KEYS.mealTemplates, [{ id: 't1' }])
    const backup = buildBackup()

    localStorage.clear()
    restoreBackup(backup)

    expect(loadJSON(STORAGE_KEYS.workoutLogs)).toEqual([{ id: 'l1' }])
    expect(loadJSON(STORAGE_KEYS.mealTemplates)).toEqual([{ id: 't1' }])
  })
})
