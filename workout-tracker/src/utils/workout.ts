import type { WorkoutPlan, WorkoutSession, WorkoutWeekAssignment } from '../types/workout'
import { getWeekDates } from './dates'

// Find a session (and its owning plan) by id across all plans.
export function findSession(plans: WorkoutPlan[], sessionId: string): { plan: WorkoutPlan; session: WorkoutSession } | null {
  for (const plan of plans) {
    const session = plan.sessions.find(s => s.id === sessionId)
    if (session) return { plan, session }
  }
  return null
}

// Resolve the sessions scheduled for a date: a per-day override wins,
// otherwise the week's assigned plan's sessions mapped to that weekday.
export function getDaySessionIds(
  date: string,
  assignments: WorkoutWeekAssignment[],
  plans: WorkoutPlan[],
  weekStartDay: 0 | 1
): string[] {
  const weekStart = getWeekDates(date, weekStartDay)[0]
  const assignment = assignments.find(a => a.week_start === weekStart)
  if (!assignment) return []

  const override = assignment.day_overrides.find(o => o.date === date)
  if (override) return override.session_ids

  if (!assignment.plan_id) return []
  const plan = plans.find(p => p.id === assignment.plan_id)
  if (!plan) return []

  const dow = new Date(date + 'T12:00:00').getDay()
  return plan.sessions.filter(s => s.day_of_week === dow).map(s => s.id)
}
