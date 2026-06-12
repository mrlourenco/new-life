import { useState, useEffect, useCallback } from 'react'
import type { WorkoutPlan, WorkoutLog, ActiveWorkout } from '../types/workout'

const KEYS = {
  plans: 'wt_plans',
  logs: 'wt_logs',
  active: 'wt_active',
}

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function usePlans() {
  const [plans, setPlans] = useState<WorkoutPlan[]>(() => load<WorkoutPlan[]>(KEYS.plans) ?? [])

  const addPlan = useCallback((plan: WorkoutPlan) => {
    setPlans(prev => {
      const updated = [...prev.filter(p => p.id !== plan.id), plan]
      save(KEYS.plans, updated)
      return updated
    })
  }, [])

  const deletePlan = useCallback((id: string) => {
    setPlans(prev => {
      const updated = prev.filter(p => p.id !== id)
      save(KEYS.plans, updated)
      return updated
    })
  }, [])

  return { plans, addPlan, deletePlan }
}

export function useLogs() {
  const [logs, setLogs] = useState<WorkoutLog[]>(() => load<WorkoutLog[]>(KEYS.logs) ?? [])

  const addLog = useCallback((log: WorkoutLog) => {
    setLogs(prev => {
      const updated = [log, ...prev]
      save(KEYS.logs, updated)
      return updated
    })
  }, [])

  const deleteLog = useCallback((id: string) => {
    setLogs(prev => {
      const updated = prev.filter(l => l.id !== id)
      save(KEYS.logs, updated)
      return updated
    })
  }, [])

  return { logs, addLog, deleteLog }
}

export function useActiveWorkout() {
  const [active, setActive] = useState<ActiveWorkout | null>(() => load<ActiveWorkout>(KEYS.active))

  const startWorkout = useCallback((workout: ActiveWorkout) => {
    setActive(workout)
    save(KEYS.active, workout)
  }, [])

  const updateActive = useCallback((workout: ActiveWorkout) => {
    setActive(workout)
    save(KEYS.active, workout)
  }, [])

  const clearActive = useCallback(() => {
    setActive(null)
    localStorage.removeItem(KEYS.active)
  }, [])

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === KEYS.active) {
        setActive(e.newValue ? JSON.parse(e.newValue) : null)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return { active, startWorkout, updateActive, clearActive }
}
