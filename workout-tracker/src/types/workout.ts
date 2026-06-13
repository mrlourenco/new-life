import type { Timestamped } from './common'

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
  rest_seconds: number
  notes?: string
  muscle: string
  equipment: string
  weight_suggestion?: string
}

export interface WorkoutSession {
  id: string
  name: string
  day_of_week?: number
  muscle_groups: string[]
  exercises: Exercise[]
}

export interface WorkoutPlan extends Timestamped {
  id: string
  name: string
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'general'
  description?: string
  days_per_week: number
  sessions: WorkoutSession[]
}

export interface SetLog {
  set_number: number
  reps_target: string
  reps_done?: number
  weight_kg?: number
  completed: boolean
  completed_at?: string
}

export interface ExerciseLog {
  exercise_id: string
  exercise_name: string
  muscle: string
  notes?: string
  sets: SetLog[]
}

export interface WorkoutLog extends Timestamped {
  id: string
  session_id: string
  plan_id: string
  session_name: string
  date: string
  started_at: string
  finished_at?: string
  duration_seconds?: number
  exercises: ExerciseLog[]
}

export interface ActiveWorkout {
  log: WorkoutLog
  session: WorkoutSession
  current_exercise_index: number
}
