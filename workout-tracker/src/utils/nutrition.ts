import type { DayPlan, DayMacros, PlannedMeal, MealPlan } from '../types/nutrition'

export function mealMacros(meal: PlannedMeal): DayMacros {
  return meal.foods.reduce((acc, f) => ({
    calories: acc.calories + (f.calories ?? 0),
    protein_g: acc.protein_g + (f.protein_g ?? 0),
    carbs_g: acc.carbs_g + (f.carbs_g ?? 0),
    fat_g: acc.fat_g + (f.fat_g ?? 0),
    fiber_g: acc.fiber_g + (f.fiber_g ?? 0),
  }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 })
}

export function dayMacros(day: DayPlan): DayMacros {
  return day.meals.reduce((acc, m) => {
    const mm = mealMacros(m)
    return {
      calories: acc.calories + mm.calories,
      protein_g: acc.protein_g + mm.protein_g,
      carbs_g: acc.carbs_g + mm.carbs_g,
      fat_g: acc.fat_g + mm.fat_g,
      fiber_g: acc.fiber_g + mm.fiber_g,
    }
  }, { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 })
}

export function findDayPlan(plan: MealPlan, date: string): DayPlan | null {
  const dow = new Date(date + 'T12:00:00').getDay()
  if (plan.type === 'weekly') {
    return plan.days.find(d => d.day_of_week === dow) ?? null
  }
  return plan.days.find(d => d.date === date) ?? null
}

export function findActivePlan(plans: MealPlan[], date: string): { plan: MealPlan; day: DayPlan } | null {
  for (const plan of plans) {
    const day = findDayPlan(plan, date)
    if (day) return { plan, day }
  }
  return null
}

export function exportNutritionData(plans: MealPlan[], logs: unknown[]) {
  const data = { exported_at: new Date().toISOString(), meal_plans: plans, nutrition_logs: logs }
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
export function dowLabel(dow: number) { return DAYS_PT[dow] ?? '' }
