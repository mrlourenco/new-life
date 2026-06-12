import type { MealPlan, DayNutritionLog } from '../../types/nutrition'
import { findActivePlan, dayMacros } from '../../utils/nutrition'
import MacroBar from '../../components/nutrition/MacroBar'
import MealCard from '../../components/nutrition/MealCard'
import { Utensils } from 'lucide-react'

interface Props {
  plans: MealPlan[]
  logs: DayNutritionLog[]
  today: string
  onSaveLog: (log: DayNutritionLog) => void
}

export default function NutritionTodayPage({ plans, logs, today, onSaveLog }: Props) {
  const found = findActivePlan(plans, today)
  const log = logs.find(l => l.date === today)

  const isCompleted = (mealId: string) =>
    log?.meals.find(m => m.meal_id === mealId)?.completed ?? false

  const toggle = (mealId: string, mealName: string) => {
    const current = log?.meals ?? []
    const exists = current.find(m => m.meal_id === mealId)
    const meals = exists
      ? current.map(m => m.meal_id === mealId ? { ...m, completed: !m.completed, completed_at: !m.completed ? new Date().toISOString() : undefined } : m)
      : [...current, { meal_id: mealId, meal_name: mealName, completed: true, completed_at: new Date().toISOString() }]

    onSaveLog({
      id: log?.id ?? crypto.randomUUID(),
      date: today,
      plan_id: found?.plan.id,
      day_plan_id: found?.day.id,
      meals,
    })
  }

  if (plans.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
          <Utensils size={28} className="text-[#22c55e]" />
        </div>
        <p className="text-white font-semibold text-lg">Sem plano alimentar</p>
        <p className="text-[#737373] text-sm mt-1 max-w-xs">Importa um plano no separador Planos</p>
      </div>
    )
  }

  if (!found) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-white font-semibold">Sem plano para hoje</p>
        <p className="text-[#737373] text-sm mt-1">Nenhum plano tem entrada para este dia da semana</p>
      </div>
    )
  }

  const { plan, day } = found
  const macros = dayMacros(day)
  const completedMeals = day.meals.filter(m => isCompleted(m.id)).length
  const completedMacros = {
    calories: day.meals.filter(m => isCompleted(m.id)).reduce((acc, m) => {
      const mm = m.foods.reduce((a, f) => ({ calories: a.calories + f.calories, protein_g: a.protein_g + (f.protein_g ?? 0), carbs_g: a.carbs_g + (f.carbs_g ?? 0), fat_g: a.fat_g + (f.fat_g ?? 0), fiber_g: a.fiber_g + (f.fiber_g ?? 0) }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 })
      return acc + mm.calories
    }, 0),
    protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0,
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{day.label ?? new Date(today + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long' })}</h2>
            <p className="text-xs text-[#737373]">{plan.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{Math.round(macros.calories)}</p>
            <p className="text-xs text-[#737373]">kcal planeadas</p>
          </div>
        </div>
        {day.notes && <p className="text-xs text-[#737373] mt-1 italic">{day.notes}</p>}
      </div>

      {/* Macros overview */}
      <div className="bg-[#1a1a1a] rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">Totais do dia</p>
          <p className="text-xs text-[#737373]">{completedMeals}/{day.meals.length} refeições</p>
        </div>
        <MacroBar macros={macros} target={plan.daily_calories_target} />

        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { label: 'Proteína', val: Math.round(macros.protein_g), unit: 'g', color: 'text-[#60a5fa]' },
            { label: 'Carboidratos', val: Math.round(macros.carbs_g), unit: 'g', color: 'text-[#f97316]' },
            { label: 'Gordura', val: Math.round(macros.fat_g), unit: 'g', color: 'text-[#a78bfa]' },
            { label: 'Fibra', val: Math.round(macros.fiber_g), unit: 'g', color: 'text-[#14b8a6]' },
          ].map(({ label, val, unit, color }) => (
            <div key={label} className="bg-[#0f0f0f] rounded-xl p-2 text-center">
              <p className={`text-sm font-bold ${color}`}>{val}{unit}</p>
              <p className="text-[9px] text-[#525252] leading-tight mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-2">
        {[...day.meals].sort((a, b) => a.order - b.order).map(meal => (
          <MealCard
            key={meal.id}
            meal={meal}
            completed={isCompleted(meal.id)}
            onToggle={() => toggle(meal.id, meal.name)}
          />
        ))}
      </div>

      {completedMacros.calories > 0 && (
        <p className="text-center text-xs text-[#737373]">
          {Math.round(completedMacros.calories)} kcal consumidas
        </p>
      )}
    </div>
  )
}
