import { useState, useCallback } from 'react'
import type { MealTemplate, DayNutritionLog, NutritionPlan } from '../types/nutrition'

// v2 keys — separate from old v1 keys to avoid format conflicts
const KEYS = { templates: 'nt2_templates', logs: 'nt2_logs', plans: 'nt2_plans' }

function load<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null } catch { return null }
}
function save(key: string, v: unknown) { localStorage.setItem(key, JSON.stringify(v)) }

export function useMealTemplates() {
  const [templates, setTemplates] = useState<MealTemplate[]>(() => load<MealTemplate[]>(KEYS.templates) ?? [])

  const saveTemplate = useCallback((t: MealTemplate) => {
    setTemplates(prev => {
      const u = [...prev.filter(x => x.id !== t.id), t]
      save(KEYS.templates, u)
      return u
    })
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => { const u = prev.filter(t => t.id !== id); save(KEYS.templates, u); return u })
  }, [])

  const importTemplates = useCallback((incoming: MealTemplate[]) => {
    setTemplates(prev => {
      const map = new Map(prev.map(t => [t.id, t]))
      incoming.forEach(t => map.set(t.id, t))
      const u = Array.from(map.values())
      save(KEYS.templates, u)
      return u
    })
  }, [])

  return { templates, saveTemplate, deleteTemplate, importTemplates }
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

  return { logs, saveLog, deleteLog }
}

export function useNutritionPlans() {
  const [plans, setPlans] = useState<NutritionPlan[]>(() => load<NutritionPlan[]>(KEYS.plans) ?? [])

  const savePlan = useCallback((plan: NutritionPlan) => {
    setPlans(prev => {
      const u = [...prev.filter(p => p.id !== plan.id), plan]
      save(KEYS.plans, u)
      return u
    })
  }, [])

  const deletePlan = useCallback((id: string) => {
    setPlans(prev => { const u = prev.filter(p => p.id !== id); save(KEYS.plans, u); return u })
  }, [])

  const setActivePlan = useCallback((id: string | null) => {
    setPlans(prev => {
      const u = prev.map(p => ({ ...p, active: p.id === id }))
      save(KEYS.plans, u)
      return u
    })
  }, [])

  return { plans, savePlan, deletePlan, setActivePlan }
}
