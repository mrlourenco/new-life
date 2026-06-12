import { useState } from 'react'
import { X, RefreshCw } from 'lucide-react'
import type { MealTemplate, MealCategory, FoodItem } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import FoodPicker from './FoodPicker'

interface Props {
  template?: MealTemplate
  onSave: (t: MealTemplate) => void
  onCancel: () => void
}

export default function FoodTemplateEditor({ template, onSave, onCancel }: Props) {
  const existingFood = template?.foods[0] ?? null
  const [name, setName] = useState(template?.name ?? '')
  const [category, setCategory] = useState<MealCategory>(template?.category ?? 'outro')
  const [food, setFood] = useState<FoodItem | null>(existingFood)
  const [showPicker, setShowPicker] = useState(!existingFood)

  const handleFoodPicked = (f: FoodItem) => {
    setFood(f)
    if (!name) setName(f.name)
    setShowPicker(false)
  }

  const handleSave = () => {
    if (!name.trim() || !food) return
    onSave({
      id: template?.id ?? crypto.randomUUID(),
      type: 'food',
      name: name.trim(),
      category,
      foods: [food],
    })
  }

  if (showPicker) {
    return (
      <FoodPicker
        onAdd={handleFoodPicked}
        onClose={() => food ? setShowPicker(false) : onCancel()}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onCancel} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="text-white font-semibold flex-1">{template ? 'Editar alimento' : 'Novo alimento'}</h2>
        <button onClick={handleSave} disabled={!name.trim() || !food}
          className="px-4 py-1.5 bg-[#22c55e] rounded-lg text-white text-sm font-semibold disabled:opacity-40">
          Guardar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        <div>
          <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-1.5">Nome *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Banana, Frango grelhado"
            autoFocus={!!existingFood}
            className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]" />
        </div>

        <div>
          <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-1.5">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {MEAL_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === cat.id ? 'bg-[#22c55e] text-black' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected food preview */}
        {food && (
          <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-1">Alimento selecionado</p>
                <p className="text-sm font-semibold text-white">{food.name}</p>
                <p className="text-[10px] text-[#525252] mt-0.5">{food.quantity}</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs font-bold text-white">{Math.round(food.calories)} kcal</span>
                  {food.protein_g != null && <span className="text-[10px] text-[#60a5fa]">P {food.protein_g}g</span>}
                  {food.carbs_g != null && <span className="text-[10px] text-[#f97316]">C {food.carbs_g}g</span>}
                  {food.fat_g != null && <span className="text-[10px] text-[#a78bfa]">G {food.fat_g}g</span>}
                  {food.fiber_g != null && food.fiber_g > 0 && <span className="text-[10px] text-[#14b8a6]">F {food.fiber_g}g</span>}
                </div>
              </div>
              <button onClick={() => setShowPicker(true)} className="p-2 text-[#525252] hover:text-[#a3a3a3] flex-shrink-0">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
