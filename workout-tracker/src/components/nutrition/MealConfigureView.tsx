import { X, Clock, Apple, UtensilsCrossed } from 'lucide-react'
import type { MealTemplate } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { templateMacros } from '../../utils/nutrition'
import MacroBar from './MacroBar'

interface Props {
  template: MealTemplate
  time: string
  onTimeChange: (time: string) => void
  onConfirm: () => void
  onBack: () => void
}

export default function MealConfigureView({ template: selected, time, onTimeChange, onConfirm, onBack }: Props) {
  const macros = templateMacros(selected)
  const isFood = (selected.type ?? 'recipe') === 'food'
  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onBack} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {isFood ? <Apple size={14} className="text-[#22c55e] flex-shrink-0" /> : <UtensilsCrossed size={14} className="text-[#60a5fa] flex-shrink-0" />}
          <h2 className="text-white font-semibold truncate">{selected.name}</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        <div className="bg-[#1a1a1a] rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">{MEAL_CATEGORIES.find(c => c.id === selected.category)?.label}</p>
            <p className="text-sm font-bold text-white">{Math.round(macros.calories)} kcal</p>
          </div>
          <MacroBar macros={macros} compact />
          <div className="flex gap-3 mt-2">
            <span className="text-[10px] text-[#60a5fa]">P {Math.round(macros.protein_g)}g</span>
            <span className="text-[10px] text-[#f97316]">C {Math.round(macros.carbs_g)}g</span>
            <span className="text-[10px] text-[#a78bfa]">G {Math.round(macros.fat_g)}g</span>
          </div>
        </div>
        {selected.notes && <p className="text-xs text-[#737373] italic">"{selected.notes}"</p>}
        <div className="space-y-1.5">
          {selected.foods.map((f, i) => (
            <div key={i} className="flex justify-between text-xs bg-[#1a1a1a] rounded-xl px-3 py-2">
              <span className="text-[#a3a3a3]">{f.name} <span className="text-[#525252]">({f.quantity})</span></span>
              <span className="text-[#737373]">{Math.round(f.calories)} kcal</span>
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-1.5">Hora (opcional)</label>
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3">
            <Clock size={14} className="text-[#525252]" />
            <input type="time" value={time} onChange={e => onTimeChange(e.target.value)} className="flex-1 bg-transparent text-white text-sm outline-none" />
          </div>
        </div>
        <button onClick={onConfirm} className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold">
          Registar {isFood ? 'alimento' : 'receita'}
        </button>
      </div>
    </div>
  )
}
