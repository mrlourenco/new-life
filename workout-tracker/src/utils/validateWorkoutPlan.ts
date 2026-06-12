import type { WorkoutPlan } from '../types/workout'

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object'
}

function validateExercise(data: unknown): boolean {
  if (!isRecord(data)) return false
  return typeof data.id === 'string'
    && typeof data.name === 'string'
    && typeof data.sets === 'number' && data.sets > 0
    && typeof data.reps === 'string'
    && typeof data.rest_seconds === 'number'
    && typeof data.muscle === 'string'
    && typeof data.equipment === 'string'
}

function validateSession(data: unknown): boolean {
  if (!isRecord(data)) return false
  if (typeof data.id !== 'string' || typeof data.name !== 'string') return false
  if (data.day_of_week !== undefined && (typeof data.day_of_week !== 'number' || data.day_of_week < 0 || data.day_of_week > 6)) return false
  if (!Array.isArray(data.exercises) || data.exercises.length === 0) return false
  return data.exercises.every(validateExercise)
}

export function validatePlan(data: unknown): data is WorkoutPlan {
  if (!isRecord(data)) return false
  if (typeof data.id !== 'string') return false
  if (typeof data.name !== 'string') return false
  if (!['strength', 'hypertrophy', 'endurance', 'general'].includes(data.goal as string)) return false
  if (!Array.isArray(data.sessions) || data.sessions.length === 0) return false
  return data.sessions.every(validateSession)
}
