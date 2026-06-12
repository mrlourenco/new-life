import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import type { MealCategory } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'

// Full-screen modal shell shared by the template editors: header with
// cancel/title/save plus a scrollable body.
export function EditorShell({ title, onCancel, saveDisabled, onSave, children }: {
  title: string
  onCancel: () => void
  saveDisabled: boolean
  onSave: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onCancel} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="text-white font-semibold flex-1">{title}</h2>
        <button onClick={onSave} disabled={saveDisabled}
          className="px-4 py-1.5 bg-[#22c55e] rounded-lg text-white text-sm font-semibold disabled:opacity-40">
          Guardar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        {children}
      </div>
    </div>
  )
}

export function CategoryPicker({ value, onChange }: { value: MealCategory; onChange: (c: MealCategory) => void }) {
  return (
    <div>
      <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-1.5">Categoria</label>
      <div className="flex flex-wrap gap-2">
        {MEAL_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => onChange(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${value === cat.id ? 'bg-[#22c55e] text-black' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
