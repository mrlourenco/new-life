import { useState, useCallback } from 'react'
import type { MealTemplate, DayNutritionLog, NutritionPlan } from '../types/nutrition'
import { STORAGE_KEYS, loadJSON, saveJSON, stamp } from '../utils/storage'

export function useMealTemplates() {
  const [templates, setTemplates] = useState<MealTemplate[]>(() => loadJSON<MealTemplate[]>(STORAGE_KEYS.mealTemplates) ?? [])

  const saveTemplate = useCallback((t: MealTemplate) => {
    setTemplates(prev => {
      const u = [...prev.filter(x => x.id !== t.id), stamp(t)]
      saveJSON(STORAGE_KEYS.mealTemplates, u)
      return u
    })
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => { const u = prev.filter(t => t.id !== id); saveJSON(STORAGE_KEYS.mealTemplates, u); return u })
  }, [])

  const importTemplates = useCallback((incoming: MealTemplate[]) => {
    setTemplates(prev => {
      const map = new Map(prev.map(t => [t.id, t]))
      incoming.forEach(t => map.set(t.id, stamp(t)))
      const u = Array.from(map.values())
      saveJSON(STORAGE_KEYS.mealTemplates, u)
      return u
    })
  }, [])

  return { templates, saveTemplate, deleteTemplate, importTemplates }
}

export function useNutritionLogs() {
  const [logs, setLogs] = useState<DayNutritionLog[]>(() => loadJSON<DayNutritionLog[]>(STORAGE_KEYS.nutritionLogs) ?? [])

  const saveLog = useCallback((log: DayNutritionLog) => {
    setLogs(prev => {
      const u = [stamp(log), ...prev.filter(l => l.id !== log.id)]
      saveJSON(STORAGE_KEYS.nutritionLogs, u)
      return u
    })
  }, [])

  const deleteLog = useCallback((id: string) => {
    setLogs(prev => { const u = prev.filter(l => l.id !== id); saveJSON(STORAGE_KEYS.nutritionLogs, u); return u })
  }, [])

  return { logs, saveLog, deleteLog }
}

export function useNutritionPlans() {
  const [plans, setPlans] = useState<NutritionPlan[]>(() => loadJSON<NutritionPlan[]>(STORAGE_KEYS.nutritionPlans) ?? [])

  const savePlan = useCallback((plan: NutritionPlan) => {
    setPlans(prev => {
      const u = [...prev.filter(p => p.id !== plan.id), stamp(plan)]
      saveJSON(STORAGE_KEYS.nutritionPlans, u)
      return u
    })
  }, [])

  const deletePlan = useCallback((id: string) => {
    setPlans(prev => { const u = prev.filter(p => p.id !== id); saveJSON(STORAGE_KEYS.nutritionPlans, u); return u })
  }, [])

  const setActivePlan = useCallback((id: string | null) => {
    setPlans(prev => {
      const u = prev.map(p => {
        const active = p.id === id
        return active === p.active ? p : stamp({ ...p, active })
      })
      saveJSON(STORAGE_KEYS.nutritionPlans, u)
      return u
    })
  }, [])

  return { plans, savePlan, deletePlan, setActivePlan }
}
