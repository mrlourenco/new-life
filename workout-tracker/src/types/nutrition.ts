import type { Timestamped } from './common'

export interface FoodItem {
  name: string
  quantity: string
  calories: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  fiber_g?: number
}

export interface DayMacros {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
}

export type MealCategory = 'pequeno-almoço' | 'lanche-manha' | 'almoço' | 'lanche-tarde' | 'jantar' | 'outro'

export const MEAL_CATEGORIES: { id: MealCategory; label: string; defaultTime: string }[] = [
  { id: 'pequeno-almoço', label: 'Pequeno-almoço', defaultTime: '08:00' },
  { id: 'lanche-manha', label: 'Lanche manhã', defaultTime: '10:30' },
  { id: 'almoço', label: 'Almoço', defaultTime: '13:00' },
  { id: 'lanche-tarde', label: 'Lanche tarde', defaultTime: '16:30' },
  { id: 'jantar', label: 'Jantar', defaultTime: '20:00' },
  { id: 'outro', label: 'Outro', defaultTime: '' },
]

// Reusable meal template (library)
export interface MealTemplate extends Timestamped {
  id: string
  name: string
  type?: 'food' | 'recipe'   // 'food' = single item, 'recipe' = composed meal; defaults to 'recipe'
  category: MealCategory
  notes?: string
  foods: FoodItem[]
}

// A logged meal entry for a specific day
export interface MealEntry {
  id: string
  template_id?: string   // reference to library template if from library
  name: string
  category: MealCategory
  time?: string          // 'HH:MM'
  foods: FoodItem[]      // snapshot at time of logging
}

// Daily nutrition log
export interface DayNutritionLog extends Timestamped {
  id: string
  date: string           // 'YYYY-MM-DD'
  entries: MealEntry[]
  notes?: string
}

// Week plan: maps days to lists of template IDs
export interface PlanDay {
  day_of_week: number    // 0=Sunday … 6=Saturday
  template_ids: string[]
}

export interface NutritionPlan extends Timestamped {
  id: string
  name: string
  description?: string
  goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general'
  daily_calories_target?: number
  days: PlanDay[]
}

// Per-date override of a plan's template list
export interface DayOverride {
  date: string           // 'YYYY-MM-DD'
  template_ids: string[]
}

// Associates a specific week with a plan (and optional per-day overrides)
export interface WeekAssignment extends Timestamped {
  id: string
  week_start: string     // 'YYYY-MM-DD' — first day of the week (Mon or Sun)
  plan_id?: string       // undefined = no plan for this week
  day_overrides: DayOverride[]
}

// Import/export envelope (v2)
export interface NutritionImport {
  version: 2
  templates?: MealTemplate[]
  plan?: NutritionPlan
}
