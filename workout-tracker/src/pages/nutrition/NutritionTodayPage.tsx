import { useState } from 'react'
import { Plus, Trash2, Utensils, Clock, Pencil } from 'lucide-react'
import type { MealTemplate, MealEntry, DayNutritionLog, NutritionPlan } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import type { MacroTargets } from '../../types/profile'
import { DEFAULT_MACRO_TARGETS } from '../../types/profile'
import { entryMacros, dayTotals, getActivePlan, getSuggestedTemplateIds } from '../../utils/nutrition'
import MacroBar from '../../components/nutrition/MacroBar'
import MealEntryLogger from '../../components/nutrition/MealEntryLogger'
import MealEntryEditor from '../../components/nutrition/MealEntryEditor'

function macroColor(value: number, target: number, baseColor: string): string {
  if (target <= 0) return baseColor
  const ratio = value / target
  if (ratio > 1.2) return 'text-red-500'
  if (ratio > 1.1) return 'text-yellow-400'
  return baseColor
}

interface Props {
  today: string
  templates: MealTemplate[]
  logs: DayNutritionLog[]
  plans: NutritionPlan[]
  macroTargets?: MacroTargets
  onSaveLog: (log: DayNutritionLog) => void
  onSaveTemplate: (t: MealTemplate) => void
}

export default function NutritionTodayPage({ today, templates, logs, plans, macroTargets, onSaveLog, onSaveTemplate }: Props) {
  const mt = macroTargets ?? DEFAULT_MACRO_TARGETS
  const [showLogger, setShowLogger] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MealEntry | null>(null)

  const activePlan = getActivePlan(plans)
  const log = logs.find(l => l.date === today)
  const entries = [...(log?.entries ?? [])].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))

  const totals = log ? dayTotals(log) : { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  const target = activePlan?.daily_calories_target

  const suggestedIds = getSuggestedTemplateIds(activePlan, today)
  const todayEntryTemplateIds = entries.map(e => e.template_id).filter(Boolean) as string[]

  const removeEntry = (id: string) => {
    const updated: DayNutritionLog = {
      id: log?.id ?? crypto.randomUUID(),
      date: today,
      entries: (log?.entries ?? []).filter(e => e.id !== id),
    }
    onSaveLog(updated)
  }

  const handleLog = (entry: MealEntry) => {
    const updated: DayNutritionLog = {
      id: log?.id ?? crypto.randomUUID(),
      date: today,
      entries: [...(log?.entries ?? []), entry],
    }
    onSaveLog(updated)
  }

  const handleEditSave = (updated: MealEntry) => {
    const updatedLog: DayNutritionLog = {
      id: log?.id ?? crypto.randomUUID(),
      date: today,
      entries: (log?.entries ?? []).map(e => e.id === updated.id ? updated : e),
    }
    onSaveLog(updatedLog)
    setEditingEntry(null)
  }

  // Quick-log a template directly without opening the full logger
  const quickLog = (t: MealTemplate) => {
    const cat = MEAL_CATEGORIES.find(c => c.id === t.category)
    handleLog({
      id: crypto.randomUUID(),
      template_id: t.id,
      name: t.name,
      category: t.category,
      time: cat?.defaultTime || undefined,
      foods: [...t.foods],
    })
  }

  // Suggestions: templates from plan not yet logged today, organized by category
  const unloggedSuggestions = suggestedIds
    .filter(id => !todayEntryTemplateIds.includes(id))
    .map(id => templates.find(t => t.id === id))
    .filter(Boolean) as MealTemplate[]

  const dateLabel = new Date(today + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

  if (editingEntry) {
    return (
      <MealEntryEditor
        entry={editingEntry}
        onSave={handleEditSave}
        onCancel={() => setEditingEntry(null)}
      />
    )
  }

  if (showLogger) {
    return (
      <MealEntryLogger
        today={today}
        templates={templates}
        logs={logs}
        suggestedIds={suggestedIds}
        todayEntryIds={todayEntryTemplateIds}
        onLog={entry => { handleLog(entry); setShowLogger(false) }}
        onSaveTemplate={onSaveTemplate}
        onClose={() => setShowLogger(false)}
      />
    )
  }

  // Group entries by category in display order
  const entriesByCategory = MEAL_CATEGORIES.map(cat => ({
    cat,
    items: entries.filter(e => e.category === cat.id),
  })).filter(g => g.items.length > 0)

  // Group suggestions by category in display order
  const suggestionsByCategory = MEAL_CATEGORIES.map(cat => ({
    cat,
    items: unloggedSuggestions.filter(t => t.category === cat.id),
  })).filter(g => g.items.length > 0)

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white capitalize">{dateLabel}</h2>
        {activePlan && <p className="text-xs text-[#737373] mt-0.5">Plano: {activePlan.name}</p>}
      </div>

      {/* Summary */}
      {(totals.calories > 0 || target) && (
        <div className="bg-[#1a1a1a] rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">Consumido hoje</p>
            <p className="text-2xl font-bold text-white">
              {Math.round(totals.calories)}
              {target && <span className="text-sm font-normal text-[#737373]"> / {target} kcal</span>}
            </p>
          </div>
          <MacroBar macros={totals} target={target} />
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: 'Proteína', val: Math.round(totals.protein_g), base: 'text-[#60a5fa]', targetVal: mt.protein_g },
              { label: 'Carboidratos', val: Math.round(totals.carbs_g), base: 'text-[#f97316]', targetVal: mt.carbs_g },
              { label: 'Gordura', val: Math.round(totals.fat_g), base: 'text-[#a78bfa]', targetVal: mt.fat_g },
              { label: 'Fibra', val: Math.round(totals.fiber_g), base: 'text-[#14b8a6]', targetVal: mt.fiber_g },
            ].map(({ label, val, base, targetVal }) => {
              const color = macroColor(val, targetVal, base)
              const overTarget = targetVal > 0
              return (
                <div key={label} className="bg-[#0f0f0f] rounded-xl p-2 text-center">
                  <p className={`text-sm font-bold ${color}`}>{val}g</p>
                  {overTarget && <p className="text-[9px] text-[#3f3f3f] leading-tight">/{targetVal}g</p>}
                  <p className="text-[9px] text-[#525252] leading-tight mt-0.5">{label}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Today's entries grouped by category */}
      {entriesByCategory.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold">Registado hoje</p>
          {entriesByCategory.map(({ cat, items }) => (
            <div key={cat.id} className="space-y-2">
              <p className="text-[11px] text-[#525252] font-semibold uppercase tracking-wider">{cat.label}</p>
              {items.map(entry => {
                const m = entryMacros(entry)
                return (
                  <div key={entry.id} className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-white truncate">{entry.name}</p>
                          <span className="text-sm font-bold text-white flex-shrink-0">{Math.round(m.calories)} kcal</span>
                        </div>
                        {entry.time && (
                          <span className="flex items-center gap-0.5 text-[10px] text-[#525252] mt-0.5">
                            <Clock size={9} />{entry.time}
                          </span>
                        )}
                        <div className="mt-1.5">
                          <MacroBar macros={m} compact />
                        </div>
                        <div className="flex gap-3 mt-1">
                          <span className="text-[10px] text-[#60a5fa]">P {Math.round(m.protein_g)}g</span>
                          <span className="text-[10px] text-[#f97316]">C {Math.round(m.carbs_g)}g</span>
                          <span className="text-[10px] text-[#a78bfa]">G {Math.round(m.fat_g)}g</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button onClick={() => setEditingEntry(entry)} className="p-1.5 text-[#525252] hover:text-[#22c55e]">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => removeEntry(entry.id)} className="p-1.5 text-[#525252] hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Plan suggestions grouped by category */}
      {suggestionsByCategory.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold">Sugerido pelo plano</p>
          {suggestionsByCategory.map(({ cat, items }) => (
            <div key={cat.id} className="space-y-2">
              <p className="text-[11px] text-[#525252] font-semibold uppercase tracking-wider">{cat.label}</p>
              {items.map(t => {
                const m = entryMacros(t)
                const previewFoods = t.foods.slice(0, 3)
                return (
                  <button key={t.id} onClick={() => quickLog(t)}
                    className="w-full text-left px-4 py-3 bg-[#1a1a1a] rounded-2xl opacity-70 border border-dashed border-[#2e2e2e] hover:opacity-100 hover:border-[#22c55e]/40 active:scale-[0.99] transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{t.name}</p>
                        <p className="text-[10px] text-[#525252] mt-0.5">{Math.round(m.calories)} kcal · P {Math.round(m.protein_g)}g · C {Math.round(m.carbs_g)}g · G {Math.round(m.fat_g)}g</p>
                        {previewFoods.length > 0 && (
                          <p className="text-[10px] text-[#3f3f3f] mt-1 truncate">
                            {previewFoods.map(f => f.name).join(', ')}{t.foods.length > 3 ? ` +${t.foods.length - 3}` : ''}
                          </p>
                        )}
                      </div>
                      <Plus size={16} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && unloggedSuggestions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-3">
            <Utensils size={24} className="text-[#22c55e]" />
          </div>
          <p className="text-white font-semibold">Sem registos hoje</p>
          <p className="text-[#737373] text-sm mt-1">Toca no + para registar uma refeição</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowLogger(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#22c55e] rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus size={24} className="text-white" />
      </button>
    </div>
  )
}
