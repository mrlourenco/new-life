import { X, Clock } from 'lucide-react'
import type { FoodItem, MealCategory } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'

interface Props {
  foodItem: FoodItem
  category: MealCategory
  onCategoryChange: (c: MealCategory) => void
  time: string
  onTimeChange: (time: string) => void
  onChangeFood: () => void
  onConfirm: () => void
  onBack: () => void
}

export default function MealNewFoodView({ foodItem, category, onCategoryChange, time, onTimeChange, onChangeFood, onConfirm, onBack }: Props) {
  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onBack} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="text-white font-semibold flex-1">Alimento avulso</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        {/* Food preview */}
        <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-1.5">Alimento</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{foodItem.name}</p>
              <p className="text-[10px] text-[#525252] mt-0.5">{foodItem.quantity} · {Math.round(foodItem.calories)} kcal</p>
              <div className="flex gap-3 mt-1">
                {foodItem.protein_g != null && <span className="text-[10px] text-[#60a5fa]">P {foodItem.protein_g}g</span>}
                {foodItem.carbs_g != null && <span className="text-[10px] text-[#f97316]">C {foodItem.carbs_g}g</span>}
                {foodItem.fat_g != null && <span className="text-[10px] text-[#a78bfa]">G {foodItem.fat_g}g</span>}
              </div>
            </div>
            <button onClick={onChangeFood}
              className="text-[10px] text-[#525252] hover:text-[#a3a3a3] border border-[#2e2e2e] rounded-lg px-2 py-1">
              Mudar
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-1.5">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {MEAL_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${category === cat.id ? 'bg-[#22c55e] text-black' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3">
          <Clock size={14} className="text-[#525252]" />
          <input type="time" value={time} onChange={e => onTimeChange(e.target.value)}
            placeholder="Hora" className="flex-1 bg-transparent text-white text-sm outline-none" />
        </div>

        <button onClick={onConfirm} className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold">
          Registar alimento
        </button>
      </div>
    </div>
  )
}
