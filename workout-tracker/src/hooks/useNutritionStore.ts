import { useState, useCallback } from 'react'
import type { MealPlan, DayNutritionLog } from '../types/nutrition'

const KEYS = { plans: 'nt_plans', logs: 'nt_logs' }

function load<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null } catch { return null }
}
function save(key: string, v: unknown) { localStorage.setItem(key, JSON.stringify(v)) }

export function useMealPlans() {
  const [plans, setPlans] = useState<MealPlan[]>(() => load<MealPlan[]>(KEYS.plans) ?? [])

  const addPlan = useCallback((plan: MealPlan) => {
    setPlans(prev => { const u = [...prev.filter(p => p.id !== plan.id), plan]; save(KEYS.plans, u); return u })
  }, [])

  const deletePlan = useCallback((id: string) => {
    setPlans(prev => { const u = prev.filter(p => p.id !== id); save(KEYS.plans, u); return u })
  }, [])

  const updatePlan = useCallback((plan: MealPlan) => {
    setPlans(prev => { const u = prev.map(p => p.id === plan.id ? plan : p); save(KEYS.plans, u); return u })
  }, [])

  return { plans, addPlan, deletePlan, updatePlan }
}

export function useNutritionLogs() {
  const [logs, setLogs] = useState<DayNutritionLog[]>(() => load<DayNutritionLog[]>(KEYS.logs) ?? [])

  const saveLog = useCallback((log: DayNutritionLog) => {
    setLogs(prev => {
      const u = [log, ...prev.filter(l => l.id !== log.id)]
      save(KEYS.logs, u)
      return u
    })
  }, [])

  const deleteLog = useCallback((id: string) => {
    setLogs(prev => { const u = prev.filter(l => l.id !== id); save(KEYS.logs, u); return u })
  }, [])

  const getLogForDate = useCallback((date: string, logs: DayNutritionLog[]) =>
    logs.find(l => l.date === date) ?? null
  , [])

  return { logs, saveLog, deleteLog, getLogForDate }
}
