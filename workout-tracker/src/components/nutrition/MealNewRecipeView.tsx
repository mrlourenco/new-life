import { X, Clock, Plus } from 'lucide-react'
import type { FoodItem, MealCategory } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { entryMacros } from '../../utils/nutrition'

interface Props {
  name: string
  onNameChange: (name: string) => void
  category: MealCategory
  onCategoryChange: (c: MealCategory) => void
  time: string
  onTimeChange: (time: string) => void
  foods: FoodItem[]
  saveToLib: boolean
  onSaveToLibChange: (v: boolean) => void
  onAddFood: () => void
  onConfirm: () => void
  onBack: () => void
}

export default function MealNewRecipeView({ name, onNameChange, category, onCategoryChange, time, onTimeChange, foods, saveToLib, onSaveToLibChange, onAddFood, onConfirm, onBack }: Props) {
  const preview = { id: '', name: '', category, foods }
  const macros = entryMacros(preview)
  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onBack} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="text-white font-semibold flex-1">Receita avulsa</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        <input value={name} onChange={e => onNameChange(e.target.value)} placeholder="Nome da receita *" autoFocus
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]" />
        <div className="flex flex-wrap gap-2">
          {MEAL_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${category === cat.id ? 'bg-[#22c55e] text-black' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}>
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3">
          <Clock size={14} className="text-[#525252]" />
          <input type="time" value={time} onChange={e => onTimeChange(e.target.value)}
            placeholder="Hora" className="flex-1 bg-transparent text-white text-sm outline-none" />
        </div>
        {foods.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-2xl p-3 space-y-1.5">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#737373]">Total</span>
              <span className="font-bold text-white">{Math.round(macros.calories)} kcal</span>
            </div>
            {foods.map((f, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-[#a3a3a3]">{f.name} ({f.quantity})</span>
                <span className="text-[#737373]">{Math.round(f.calories)} kcal</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={onAddFood}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-xl text-[#22c55e] text-sm border border-[#22c55e]/30">
          <Plus size={16} />Adicionar alimento
        </button>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={saveToLib} onChange={e => onSaveToLibChange(e.target.checked)} className="w-4 h-4 rounded accent-[#22c55e]" />
          <span className="text-sm text-[#a3a3a3]">Guardar na biblioteca</span>
        </label>
        <button onClick={onConfirm} disabled={!name.trim() || foods.length === 0}
          className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold disabled:opacity-40">
          Registar receita
        </button>
      </div>
    </div>
  )
}
