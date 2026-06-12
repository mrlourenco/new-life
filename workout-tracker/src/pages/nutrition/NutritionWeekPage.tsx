import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import type { MealPlan, DayNutritionLog } from '../../types/nutrition'
import { findActivePlan, dayMacros } from '../../utils/nutrition'
import MacroBar from '../../components/nutrition/MacroBar'

interface Props {
  plans: MealPlan[]
  logs: DayNutritionLog[]
  today: string
}

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function getWeekDates(from: string): string[] {
  const d = new Date(from + 'T12:00:00')
  const dow = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((dow + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    return dd.toISOString().slice(0, 10)
  })
}

export default function NutritionWeekPage({ plans, logs, today }: Props) {
  const [expanded, setExpanded] = useState<string | null>(today)
  const week = getWeekDates(today)

  if (plans.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 text-center">
        <p className="text-[#737373] text-sm">Sem planos alimentares. Importa um plano no separador Planos.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-2">
      <h2 className="text-lg font-bold text-white mb-3">Esta semana</h2>
      {week.map(date => {
        const found = findActivePlan(plans, date)
        const log = logs.find(l => l.date === date)
        const d = new Date(date + 'T12:00:00')
        const dowIdx = d.getDay()
        const isToday = date === today
        const isOpen = expanded === date

        const completedCount = found
          ? found.day.meals.filter(m => log?.meals.find(lm => lm.meal_id === m.id)?.completed).length
          : 0
        const macros = found ? dayMacros(found.day) : null

        return (
          <div key={date} className={`rounded-2xl overflow-hidden bg-[#1a1a1a] ${isToday ? 'ring-1 ring-[#f97316]' : ''}`}>
            <button
              className="w-full px-4 py-3 flex items-center gap-3 text-left"
              onClick={() => found && setExpanded(isOpen ? null : date)}
            >
              <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isToday ? 'bg-[#f97316]' : 'bg-[#2e2e2e]'}`}>
                <span className={`text-[10px] font-medium ${isToday ? 'text-black' : 'text-[#737373]'}`}>{DAYS_SHORT[dowIdx]}</span>
                <span className={`text-sm font-bold leading-tight ${isToday ? 'text-black' : 'text-white'}`}>{d.getDate()}</span>
              </div>

              <div className="flex-1 min-w-0">
                {found ? (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-white truncate pr-2">
                        {found.day.label ?? DAYS_SHORT[dowIdx]}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {completedCount > 0 && (
                          <span className="text-[10px] text-[#4ade80]">{completedCount}/{found.day.meals.length}</span>
                        )}
                        <span className="text-sm font-bold text-white">{Math.round(macros!.calories)} kcal</span>
                      </div>
                    </div>
                    <MacroBar macros={macros!} compact />
                  </>
                ) : (
                  <p className="text-sm text-[#525252]">Sem plano</p>
                )}
              </div>

              {found && (
                <span className="text-[#525252] flex-shrink-0">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              )}
            </button>

            {isOpen && found && (
              <div className="border-t border-[#2e2e2e] px-4 pb-3 pt-2 space-y-1.5">
                {found.day.notes && (
                  <p className="text-xs text-[#737373] italic mb-2">{found.day.notes}</p>
                )}
                {[...found.day.meals].sort((a, b) => a.order - b.order).map(meal => {
                  const done = log?.meals.find(lm => lm.meal_id === meal.id)?.completed ?? false
                  const kcal = meal.foods.reduce((acc, f) => acc + (f.calories ?? 0), 0)
                  return (
                    <div key={meal.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {done
                          ? <CheckCircle2 size={12} className="text-[#4ade80] flex-shrink-0" />
                          : <div className="w-3 h-3 rounded-full border border-[#525252] flex-shrink-0" />
                        }
                        <span className={`truncate ${done ? 'text-[#4ade80]' : 'text-[#a3a3a3]'}`}>{meal.name}</span>
                        {meal.time && <span className="text-[#525252] flex-shrink-0">{meal.time}</span>}
                      </div>
                      <span className="text-[#737373] flex-shrink-0 ml-2">{Math.round(kcal)} kcal</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
