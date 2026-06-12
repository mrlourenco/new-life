import { useState, useCallback } from 'react'
import type { WeekAssignment } from '../types/nutrition'

const KEY = 'nl_week_assignments_v1'

function load<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null } catch { return null }
}
function persist(v: unknown) { localStorage.setItem(KEY, JSON.stringify(v)) }

export function useWeekAssignments() {
  const [assignments, setAssignments] = useState<WeekAssignment[]>(
    () => load<WeekAssignment[]>(KEY) ?? []
  )

  const assignPlanToWeek = useCallback((weekStart: string, planId: string | null) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.week_start === weekStart)
      if (existing) {
        const updated = { ...existing, plan_id: planId ?? undefined }
        let next: WeekAssignment[]
        if (!updated.plan_id && updated.day_overrides.length === 0) {
          next = prev.filter(a => a.week_start !== weekStart)
        } else {
          next = prev.map(a => a.week_start === weekStart ? updated : a)
        }
        persist(next); return next
      }
      if (!planId) return prev
      const newA: WeekAssignment = { id: crypto.randomUUID(), week_start: weekStart, plan_id: planId, day_overrides: [] }
      const next = [...prev, newA]
      persist(next); return next
    })
  }, [])

  const saveDayOverride = useCallback((weekStart: string, date: string, templateIds: string[]) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.week_start === weekStart)
      if (existing) {
        const overrides = existing.day_overrides.filter(o => o.date !== date)
        if (templateIds.length > 0) overrides.push({ date, template_ids: templateIds })
        const updated = { ...existing, day_overrides: overrides }
        let next: WeekAssignment[]
        if (!updated.plan_id && updated.day_overrides.length === 0) {
          next = prev.filter(a => a.week_start !== weekStart)
        } else {
          next = prev.map(a => a.week_start === weekStart ? updated : a)
        }
        persist(next); return next
      }
      if (templateIds.length === 0) return prev
      const newA: WeekAssignment = {
        id: crypto.randomUUID(),
        week_start: weekStart,
        plan_id: undefined,
        day_overrides: [{ date, template_ids: templateIds }],
      }
      const next = [...prev, newA]
      persist(next); return next
    })
  }, [])

  return { assignments, assignPlanToWeek, saveDayOverride }
}
