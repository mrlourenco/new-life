import { describe, it, expect } from 'vitest'
import { getDaySessionIds, findSession } from './workout'
import type { WorkoutPlan, WorkoutWeekAssignment } from '../types/workout'

const session = (id: string, day?: number) => ({
  id, name: id, day_of_week: day, muscle_groups: [], exercises: [],
})

const plan: WorkoutPlan = {
  id: 'p1', name: 'Plano', goal: 'hypertrophy', days_per_week: 3,
  sessions: [session('push', 5), session('pull', 5), session('legs', 3)], // Fri, Fri, Wed
}

describe('findSession', () => {
  it('locates a session and its plan by id', () => {
    expect(findSession([plan], 'legs')?.plan.id).toBe('p1')
    expect(findSession([plan], 'legs')?.session.name).toBe('legs')
  })
  it('returns null for an unknown id', () => {
    expect(findSession([plan], 'missing')).toBeNull()
  })
})

describe('getDaySessionIds', () => {
  const assignment: WorkoutWeekAssignment = {
    id: 'a1', week_start: '2026-06-08', plan_id: 'p1',
    day_overrides: [{ date: '2026-06-12', session_ids: ['legs'] }], // Friday override
  }

  it('returns the day override when one exists', () => {
    expect(getDaySessionIds('2026-06-12', [assignment], [plan], 1)).toEqual(['legs'])
  })

  it('falls back to the plan sessions for that weekday', () => {
    const noOverride = { ...assignment, day_overrides: [] }
    // 2026-06-12 is a Friday (dow 5) → push + pull
    expect(getDaySessionIds('2026-06-12', [noOverride], [plan], 1)).toEqual(['push', 'pull'])
    // 2026-06-10 is a Wednesday (dow 3) → legs
    expect(getDaySessionIds('2026-06-10', [noOverride], [plan], 1)).toEqual(['legs'])
  })

  it('returns empty when the week has no assignment', () => {
    expect(getDaySessionIds('2026-06-12', [], [plan], 1)).toEqual([])
  })

  it('returns empty when the assignment has no plan and no matching override', () => {
    const planless: WorkoutWeekAssignment = { id: 'a2', week_start: '2026-06-08', day_overrides: [] }
    expect(getDaySessionIds('2026-06-12', [planless], [plan], 1)).toEqual([])
  })
})
