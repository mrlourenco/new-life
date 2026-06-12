import { Trash2 } from 'lucide-react'
import type { MealPlan, DayNutritionLog } from '../../types/nutrition'
import { dayMacros } from '../../utils/nutrition'
import MacroBar from '../../components/nutrition/MacroBar'

interface Props {
  plans: MealPlan[]
  logs: DayNutritionLog[]
  onDeleteLog: (id: string) => void
}

export default function NutritionHistoryPage({ plans, logs, onDeleteLog }: Props) {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 text-center">
        <p className="text-[#737373] text-sm">Sem registos. Marca refeições concluídas no separador Hoje.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-3">
      <h2 className="text-lg font-bold text-white mb-3">Histórico alimentar</h2>
      {sorted.map(log => {
        const plan = plans.find(p => p.id === log.plan_id)
        const day = plan?.days.find(d => d.id === log.day_plan_id)

        const completedMeals = log.meals.filter(m => m.completed).length
        const totalMeals = day?.meals.length ?? log.meals.length

        const consumedCalories = day
          ? day.meals
              .filter(m => log.meals.find(lm => lm.meal_id === m.id)?.completed)
              .reduce((acc, m) => acc + m.foods.reduce((a, f) => a + (f.calories ?? 0), 0), 0)
          : 0

        const macros = day ? dayMacros(day) : null
        const date = new Date(log.date + 'T12:00:00')
        const dateLabel = date.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
        const allDone = completedMeals === totalMeals && totalMeals > 0

        return (
          <div key={log.id} className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white capitalize">{dateLabel}</p>
                {plan && <p className="text-xs text-[#737373] mt-0.5">{plan.name}</p>}
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs ${allDone ? 'text-[#4ade80]' : 'text-[#525252]'}`}>
                    {completedMeals}/{totalMeals} refeições
                  </span>
                  {consumedCalories > 0 && (
                    <span className="text-xs text-[#a3a3a3]">{Math.round(consumedCalories)} kcal</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDeleteLog(log.id)}
                className="p-1.5 text-[#525252] hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {macros && (
              <div className="mt-2.5">
                <MacroBar macros={macros} compact />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
