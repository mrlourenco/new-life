import { useState, useEffect, useCallback, useMemo } from 'react'
import type { WorkoutPlan, WorkoutLog, ActiveWorkout, SetLog } from '../types/workout'
import { STORAGE_KEYS, loadJSON, saveJSON, removeJSON, stamp } from '../utils/storage'

export interface ExerciseHistory {
  date: string
  sets: SetLog[]
}

export function useExerciseHistory(logs: WorkoutLog[]) {
  return useMemo(() => {
    const map = new Map<string, ExerciseHistory>()
    for (const log of logs) {
      for (const ex of log.exercises) {
        const key = ex.exercise_name.toLowerCase().trim()
        if (!map.has(key)) {
          map.set(key, { date: log.date, sets: ex.sets.filter(s => s.completed) })
        }
      }
    }
    return map
  }, [logs])
}

export function usePlans() {
  const [plans, setPlans] = useState<WorkoutPlan[]>(() => loadJSON<WorkoutPlan[]>(STORAGE_KEYS.workoutPlans) ?? [])

  const addPlan = useCallback((plan: WorkoutPlan) => {
    setPlans(prev => {
      const updated = [...prev.filter(p => p.id !== plan.id), stamp(plan)]
      saveJSON(STORAGE_KEYS.workoutPlans, updated)
      return updated
    })
  }, [])

  const deletePlan = useCallback((id: string) => {
    setPlans(prev => {
      const updated = prev.filter(p => p.id !== id)
      saveJSON(STORAGE_KEYS.workoutPlans, updated)
      return updated
    })
  }, [])

  return { plans, addPlan, deletePlan }
}

export function useLogs() {
  const [logs, setLogs] = useState<WorkoutLog[]>(() => loadJSON<WorkoutLog[]>(STORAGE_KEYS.workoutLogs) ?? [])

  const addLog = useCallback((log: WorkoutLog) => {
    setLogs(prev => {
      const updated = [stamp(log), ...prev]
      saveJSON(STORAGE_KEYS.workoutLogs, updated)
      return updated
    })
  }, [])

  const updateLog = useCallback((log: WorkoutLog) => {
    setLogs(prev => {
      const updated = prev.map(l => l.id === log.id ? stamp(log) : l)
      saveJSON(STORAGE_KEYS.workoutLogs, updated)
      return updated
    })
  }, [])

  const deleteLog = useCallback((id: string) => {
    setLogs(prev => {
      const updated = prev.filter(l => l.id !== id)
      saveJSON(STORAGE_KEYS.workoutLogs, updated)
      return updated
    })
  }, [])

  return { logs, addLog, updateLog, deleteLog }
}

export function useActiveWorkout() {
  const [active, setActive] = useState<ActiveWorkout | null>(() => loadJSON<ActiveWorkout>(STORAGE_KEYS.activeWorkout))

  const startWorkout = useCallback((workout: ActiveWorkout) => {
    setActive(workout)
    saveJSON(STORAGE_KEYS.activeWorkout, workout)
  }, [])

  const updateActive = useCallback((workout: ActiveWorkout) => {
    setActive(workout)
    saveJSON(STORAGE_KEYS.activeWorkout, workout)
  }, [])

  const clearActive = useCallback(() => {
    setActive(null)
    removeJSON(STORAGE_KEYS.activeWorkout)
  }, [])

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.activeWorkout) {
        setActive(e.newValue ? JSON.parse(e.newValue) : null)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return { active, startWorkout, updateActive, clearActive }
}
