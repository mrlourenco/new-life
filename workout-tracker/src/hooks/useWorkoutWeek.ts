import { useState, useCallback } from 'react'
import type { WorkoutWeekAssignment } from '../types/workout'
import { STORAGE_KEYS, loadJSON, saveJSON, stamp } from '../utils/storage'

export function useWorkoutWeekAssignments() {
  const [assignments, setAssignments] = useState<WorkoutWeekAssignment[]>(
    () => loadJSON<WorkoutWeekAssignment[]>(STORAGE_KEYS.workoutWeekAssignments) ?? []
  )

  const assignPlanToWeek = useCallback((weekStart: string, planId: string | null) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.week_start === weekStart)
      if (existing) {
        const updated = stamp({ ...existing, plan_id: planId ?? undefined })
        let next: WorkoutWeekAssignment[]
        if (!updated.plan_id && updated.day_overrides.length === 0) {
          next = prev.filter(a => a.week_start !== weekStart)
        } else {
          next = prev.map(a => a.week_start === weekStart ? updated : a)
        }
        saveJSON(STORAGE_KEYS.workoutWeekAssignments, next); return next
      }
      if (!planId) return prev
      const newA: WorkoutWeekAssignment = { id: crypto.randomUUID(), week_start: weekStart, plan_id: planId, day_overrides: [] }
      const next = [...prev, stamp(newA)]
      saveJSON(STORAGE_KEYS.workoutWeekAssignments, next); return next
    })
  }, [])

  const saveDayOverride = useCallback((weekStart: string, date: string, sessionIds: string[]) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.week_start === weekStart)
      if (existing) {
        const overrides = existing.day_overrides.filter(o => o.date !== date)
        if (sessionIds.length > 0) overrides.push({ date, session_ids: sessionIds })
        const updated = stamp({ ...existing, day_overrides: overrides })
        let next: WorkoutWeekAssignment[]
        if (!updated.plan_id && updated.day_overrides.length === 0) {
          next = prev.filter(a => a.week_start !== weekStart)
        } else {
          next = prev.map(a => a.week_start === weekStart ? updated : a)
        }
        saveJSON(STORAGE_KEYS.workoutWeekAssignments, next); return next
      }
      if (sessionIds.length === 0) return prev
      const newA: WorkoutWeekAssignment = {
        id: crypto.randomUUID(),
        week_start: weekStart,
        plan_id: undefined,
        day_overrides: [{ date, session_ids: sessionIds }],
      }
      const next = [...prev, stamp(newA)]
      saveJSON(STORAGE_KEYS.workoutWeekAssignments, next); return next
    })
  }, [])

  return { assignments, assignPlanToWeek, saveDayOverride }
}
