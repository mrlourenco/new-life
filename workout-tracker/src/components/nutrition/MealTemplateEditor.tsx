import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { MealTemplate, MealCategory, FoodItem } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { templateMacros } from '../../utils/nutrition'
import MacroBar from './MacroBar'
import FoodPicker from './FoodPicker'

interface Props {
  template?: MealTemplate
  onSave: (t: MealTemplate) => void
  onCancel: () => void
}

export default function MealTemplateEditor({ template, onSave, onCancel }: Props) {
  const [name, setName] = useState(template?.name ?? '')
  const [category, setCategory] = useState<MealCategory>(template?.category ?? 'outro')
  const [notes, setNotes] = useState(template?.notes ?? '')
  const [foods, setFoods] = useState<FoodItem[]>(template?.foods ?? [])
  const [showPicker, setShowPicker] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ id: template?.id ?? crypto.randomUUID(), name: name.trim(), category, notes: notes || undefined, foods })
  }

  const preview = templateMacros({ id: '', name: '', category, foods })

  if (showPicker) {
    return <FoodPicker onAdd={f => { setFoods(prev => [...prev, f]); setShowPicker(false) }} onClose={() => setShowPicker(false)} />
  }

  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onCancel} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="text-white font-semibold flex-1">{template ? 'Editar refeição' : 'Nova refeição'}</h2>
        <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-1.5 bg-[#22c55e] rounded-lg text-white text-sm font-semibold disabled:opacity-40">
          Guardar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        <div>
          <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-1.5">Nome *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Almoço frango" autoFocus
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

        <div>
          <label className="text-xs text-[#737373] block mb-1.5">Notas (opcional)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Dica ou observação..."
            className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]" />
        </div>

        {foods.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">Total</p>
              <p className="text-sm font-bold text-white">{Math.round(preview.calories)} kcal</p>
            </div>
            <MacroBar macros={preview} compact />
            <div className="flex gap-3 mt-2">
              <span className="text-[10px] text-[#60a5fa]">P {Math.round(preview.protein_g)}g</span>
              <span className="text-[10px] text-[#f97316]">C {Math.round(preview.carbs_g)}g</span>
              <span className="text-[10px] text-[#a78bfa]">G {Math.round(preview.fat_g)}g</span>
              {preview.fiber_g > 0 && <span className="text-[10px] text-[#14b8a6]">F {Math.round(preview.fiber_g)}g</span>}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-2">Alimentos</p>
          {foods.length === 0
            ? <p className="text-[#525252] text-sm py-3 text-center">Sem alimentos. Adiciona abaixo.</p>
            : (
              <div className="space-y-2 mb-3">
                {foods.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{f.name}</p>
                      <p className="text-[10px] text-[#525252]">{f.quantity} · {Math.round(f.calories)} kcal{f.protein_g ? ` · P ${f.protein_g}g` : ''}</p>
                    </div>
                    <button onClick={() => setFoods(prev => prev.filter((_, j) => j !== i))} className="p-1.5 text-[#525252] hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )
          }
          <button onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-xl text-[#22c55e] text-sm border border-[#22c55e]/30 hover:border-[#22c55e]/60">
            <Plus size={16} />Adicionar alimento
          </button>
        </div>
      </div>
    </div>
  )
}
