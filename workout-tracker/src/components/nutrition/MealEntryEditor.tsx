import { useState } from 'react'
import { X, Clock, Plus, Trash2 } from 'lucide-react'
import type { MealEntry, MealCategory, FoodItem } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { entryMacros } from '../../utils/nutrition'
import MacroBar from './MacroBar'
import FoodPicker from './FoodPicker'

interface Props {
  entry: MealEntry
  onSave: (updated: MealEntry) => void
  onCancel: () => void
}

export default function MealEntryEditor({ entry, onSave, onCancel }: Props) {
  const [name, setName] = useState(entry.name)
  const [category, setCategory] = useState<MealCategory>(entry.category)
  const [time, setTime] = useState(entry.time ?? '')
  const [foods, setFoods] = useState<FoodItem[]>([...entry.foods])
  const [showFoodPicker, setShowFoodPicker] = useState(false)

  const macros = entryMacros({ foods })

  const removeFood = (i: number) => setFoods(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ ...entry, name: name.trim(), category, time: time || undefined, foods })
  }

  if (showFoodPicker) {
    return (
      <FoodPicker
        onAdd={f => { setFoods(prev => [...prev, f]); setShowFoodPicker(false) }}
        onClose={() => setShowFoodPicker(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onCancel} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="text-white font-semibold flex-1">Editar refeição</h2>
        <button onClick={handleSave} disabled={!name.trim() || foods.length === 0}
          className="px-4 py-1.5 bg-[#22c55e] rounded-lg text-white text-sm font-semibold disabled:opacity-40">
          Guardar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da refeição *"
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]" />

        <div className="flex flex-wrap gap-2">
          {MEAL_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${category === cat.id ? 'bg-[#22c55e] text-black' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3">
          <Clock size={14} className="text-[#525252]" />
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm outline-none" />
        </div>

        {foods.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-2xl p-3 space-y-1.5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[#737373] font-semibold uppercase tracking-wider">Alimentos</span>
              <span className="text-sm font-bold text-white">{Math.round(macros.calories)} kcal</span>
            </div>
            <MacroBar macros={macros} compact />
            <div className="flex gap-3 mt-1 mb-2">
              <span className="text-[10px] text-[#60a5fa]">P {Math.round(macros.protein_g)}g</span>
              <span className="text-[10px] text-[#f97316]">C {Math.round(macros.carbs_g)}g</span>
              <span className="text-[10px] text-[#a78bfa]">G {Math.round(macros.fat_g)}g</span>
            </div>
            {foods.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#0f0f0f] rounded-xl px-3 py-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-[#a3a3a3]">{f.name}</span>
                  <span className="text-[10px] text-[#525252] ml-1">({f.quantity})</span>
                </div>
                <span className="text-[10px] text-[#737373] flex-shrink-0">{Math.round(f.calories)} kcal</span>
                <button onClick={() => removeFood(i)} className="p-1 text-[#525252] hover:text-red-400 flex-shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => setShowFoodPicker(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-xl text-[#22c55e] text-sm border border-[#22c55e]/30">
          <Plus size={16} />Adicionar alimento
        </button>
      </div>
    </div>
  )
}
