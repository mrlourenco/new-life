import { Check, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { PlannedMeal } from '../../types/nutrition'
import { mealMacros } from '../../utils/nutrition'
import MacroBar from './MacroBar'

interface Props {
  meal: PlannedMeal
  completed: boolean
  onToggle: () => void
}

export default function MealCard({ meal, completed, onToggle }: Props) {
  const [open, setOpen] = useState(false)
  const macros = mealMacros(meal)

  return (
    <div className={`rounded-2xl overflow-hidden transition-colors ${completed ? 'bg-[#0f2318]' : 'bg-[#1a1a1a]'}`}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={`w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors ${
              completed ? 'bg-[#166534] text-[#4ade80]' : 'bg-[#2e2e2e] text-[#525252] hover:bg-[#3a3a3a]'
            }`}
          >
            <Check size={16} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <p className={`font-semibold text-sm truncate ${completed ? 'text-[#4ade80]' : 'text-white'}`}>
                  {meal.name}
                </p>
                {meal.time && (
                  <span className="flex items-center gap-1 text-[10px] text-[#525252] flex-shrink-0">
                    <Clock size={9} />{meal.time}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-white flex-shrink-0">
                {Math.round(macros.calories)} kcal
              </span>
            </div>
            <div className="mt-1.5">
              <MacroBar macros={macros} compact />
            </div>
            <div className="flex gap-3 mt-1">
              <span className="text-[10px] text-[#60a5fa]">P {Math.round(macros.protein_g)}g</span>
              <span className="text-[10px] text-[#f97316]">C {Math.round(macros.carbs_g)}g</span>
              <span className="text-[10px] text-[#a78bfa]">G {Math.round(macros.fat_g)}g</span>
            </div>
          </div>

          <button onClick={() => setOpen(o => !o)} className="p-1 text-[#525252] flex-shrink-0">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#2e2e2e] px-4 pb-3 pt-2 space-y-1.5">
          {meal.notes && <p className="text-xs text-[#737373] italic mb-2">"{meal.notes}"</p>}
          {meal.foods.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-[#a3a3a3]">{f.name} <span className="text-[#525252]">({f.quantity})</span></span>
              <span className="text-[#737373]">{f.calories} kcal</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
