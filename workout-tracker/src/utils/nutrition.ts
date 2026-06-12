import type { MealTemplate, MealEntry, DayNutritionLog, DayMacros, NutritionPlan } from '../types/nutrition'

export function sumFoods(foods: { calories: number; protein_g?: number; carbs_g?: number; fat_g?: number; fiber_g?: number }[]): DayMacros {
  let calories = 0, protein_g = 0, carbs_g = 0, fat_g = 0, fiber_g = 0
  for (const f of foods) {
    calories += f.calories ?? 0
    protein_g += f.protein_g ?? 0
    carbs_g += f.carbs_g ?? 0
    fat_g += f.fat_g ?? 0
    fiber_g += f.fiber_g ?? 0
  }
  return { calories, protein_g, carbs_g, fat_g, fiber_g }
}

export function templateMacros(t: MealTemplate): DayMacros { return sumFoods(t.foods) }
export function entryMacros(e: { foods: MealEntry['foods'] }): DayMacros { return sumFoods(e.foods) }
// alias used by older component code
export { sumFoods as mealMacros }

export function dayTotals(log: DayNutritionLog): DayMacros {
  let calories = 0, protein_g = 0, carbs_g = 0, fat_g = 0, fiber_g = 0
  for (const e of log.entries) {
    const m = entryMacros(e)
    calories += m.calories; protein_g += m.protein_g
    carbs_g += m.carbs_g; fat_g += m.fat_g; fiber_g += m.fiber_g
  }
  return { calories, protein_g, carbs_g, fat_g, fiber_g }
}

export function getActivePlan(plans: NutritionPlan[]): NutritionPlan | null {
  return plans.find(p => p.active) ?? null
}

export function getSuggestedTemplateIds(plan: NutritionPlan | null, date: string): string[] {
  if (!plan) return []
  const dow = new Date(date + 'T12:00:00').getDay()
  return plan.days.find(d => d.day_of_week === dow)?.template_ids ?? []
}

export function getWeekDates(from: string): string[] {
  const d = new Date(from + 'T12:00:00')
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    return dd.toISOString().slice(0, 10)
  })
}

export function getMonthDates(year: number, month: number): string[] {
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) =>
    new Date(year, month, i + 1).toISOString().slice(0, 10)
  )
}

export function exportNutritionData(templates: MealTemplate[], plans: NutritionPlan[], logs: DayNutritionLog[]) {
  const data = { exported_at: new Date().toISOString(), version: 2, templates, plans, logs }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nutrition-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const GOAL_PT: Record<string, string> = {
  weight_loss: 'Perda de peso',
  muscle_gain: 'Ganho muscular',
  maintenance: 'Manutenção',
  general: 'Geral',
}

const DAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export function dowLabel(dow: number) { return DAYS_PT[dow] ?? '' }
export function dowShort(dow: number) { return DAYS_SHORT[dow] ?? '' }
