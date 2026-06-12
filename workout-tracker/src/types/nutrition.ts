export interface FoodItem {
  name: string
  quantity: string
  calories: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  fiber_g?: number
}

export interface PlannedMeal {
  id: string
  order: number
  name: string
  time?: string
  notes?: string
  foods: FoodItem[]
}

export interface DayPlan {
  id: string
  label?: string
  day_of_week?: number   // 0-6 para planos semanais
  date?: string          // ISO date para planos anuais/específicos
  notes?: string
  meals: PlannedMeal[]
}

export interface MealPlan {
  id: string
  name: string
  description?: string
  goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general'
  daily_calories_target?: number
  type: 'weekly' | 'custom'
  days: DayPlan[]
}

export interface MealLogEntry {
  meal_id: string
  meal_name: string
  completed: boolean
  completed_at?: string
  notes?: string
}

export interface DayNutritionLog {
  id: string
  date: string
  plan_id?: string
  day_plan_id?: string
  meals: MealLogEntry[]
  notes?: string
}

export interface DayMacros {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
}
