import type { MealTemplate, MealEntry, DayNutritionLog, DayMacros, NutritionPlan, WeekAssignment } from '../types/nutrition'
import { getWeekDates } from './dates'

// Date helpers live in ./dates now; re-exported here for existing imports.
export { getWeekDates, getMonthDates, dowShort, dowLabel } from './dates'

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

export function getDayTemplateIds(
  date: string,
  assignments: WeekAssignment[],
  plans: NutritionPlan[],
  weekStartDay: 0 | 1
): string[] {
  const weekStart = getWeekDates(date, weekStartDay)[0]
  const assignment = assignments.find(a => a.week_start === weekStart)
  if (!assignment) return []

  const override = assignment.day_overrides.find(o => o.date === date)
  if (override) return override.template_ids

  if (!assignment.plan_id) return []
  const plan = plans.find(p => p.id === assignment.plan_id)
  if (!plan) return []

  const dow = new Date(date + 'T12:00:00').getDay()
  return plan.days.find(d => d.day_of_week === dow)?.template_ids ?? []
}

// Generate shopping items from per-date template lists; skips dates before fromDate
export function generateShoppingItemsFromDayMap(
  templateIdsByDate: Array<{ date: string; templateIds: string[] }>,
  templates: MealTemplate[],
  fromDate: string
) {
  const foodMap = new Map<string, { count: number; quantity: string }>()
  for (const { date, templateIds } of templateIdsByDate) {
    if (date < fromDate) continue
    for (const tid of templateIds) {
      const t = templates.find(tt => tt.id === tid)
      if (!t) continue
      for (const food of t.foods) {
        const key = food.name.toLowerCase().trim()
        const existing = foodMap.get(key)
        if (existing) foodMap.set(key, { count: existing.count + 1, quantity: food.quantity })
        else foodMap.set(key, { count: 1, quantity: food.quantity })
      }
    }
  }
  return Array.from(foodMap.entries()).map(([key, { count, quantity }]) => ({
    id: crypto.randomUUID(),
    name: key.charAt(0).toUpperCase() + key.slice(1),
    quantity: count > 1 ? `${quantity} × ${count}` : quantity,
    inStock: false,
    manual: false,
  }))
}

export function generateShoppingItems(plan: NutritionPlan, templates: MealTemplate[], weekDates: string[]) {
  const items = weekDates.map(date => {
    const dow = new Date(date + 'T12:00:00').getDay()
    const planDay = plan.days.find(d => d.day_of_week === dow)
    return { date, templateIds: planDay?.template_ids ?? [] }
  })
  return generateShoppingItemsFromDayMap(items, templates, weekDates[0])
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
