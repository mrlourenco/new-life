import { ChevronDown, ChevronUp, Apple, UtensilsCrossed } from 'lucide-react'
import type { MealTemplate } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { templateMacros } from '../../utils/nutrition'

export default function TemplateSection({ title, items, sectionKey, expandedSection, onToggle, todayEntryIds, onSelect }: {
  title: string
  items: MealTemplate[]
  sectionKey: string
  expandedSection: string | null
  onToggle: (key: string | null) => void
  todayEntryIds: string[]
  onSelect: (t: MealTemplate) => void
}) {
  const open = expandedSection === sectionKey
  if (items.length === 0) return null
  return (
    <div>
      <button onClick={() => onToggle(open ? null : sectionKey)}
        className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#737373] uppercase tracking-wider">
        <span>{title} ({items.length})</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="space-y-1.5">
          {items.map(t => {
            const m = templateMacros(t)
            const alreadyLogged = todayEntryIds.includes(t.id)
            const isFood = (t.type ?? 'recipe') === 'food'
            return (
              <button key={t.id} onClick={() => onSelect(t)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left ${alreadyLogged ? 'bg-[#0f2318]' : 'bg-[#1a1a1a] hover:bg-[#222]'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {isFood
                      ? <Apple size={11} className="text-[#22c55e] flex-shrink-0" />
                      : <UtensilsCrossed size={11} className="text-[#60a5fa] flex-shrink-0" />
                    }
                    <p className="text-sm font-medium text-white truncate">{t.name}</p>
                    {alreadyLogged && <span className="text-[10px] text-[#4ade80] flex-shrink-0">✓</span>}
                  </div>
                  <p className="text-[10px] text-[#525252] mt-0.5 ml-4">
                    {MEAL_CATEGORIES.find(c => c.id === t.category)?.label} · {Math.round(m.calories)} kcal
                    {isFood ? ` · ${t.foods[0]?.quantity ?? ''}` : ` · P ${Math.round(m.protein_g)}g · C ${Math.round(m.carbs_g)}g`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
