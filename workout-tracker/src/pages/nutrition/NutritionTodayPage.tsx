import { useState } from 'react'
import { Plus, Trash2, Utensils, Clock } from 'lucide-react'
import type { MealTemplate, MealEntry, DayNutritionLog, NutritionPlan } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { entryMacros, dayTotals, getActivePlan, getSuggestedTemplateIds } from '../../utils/nutrition'
import MacroBar from '../../components/nutrition/MacroBar'
import MealEntryLogger from '../../components/nutrition/MealEntryLogger'

interface Props {
  today: string
  templates: MealTemplate[]
  logs: DayNutritionLog[]
  plans: NutritionPlan[]
  onSaveLog: (log: DayNutritionLog) => void
  onSaveTemplate: (t: MealTemplate) => void
}

export default function NutritionTodayPage({ today, templates, logs, plans, onSaveLog, onSaveTemplate }: Props) {
  const [showLogger, setShowLogger] = useState(false)

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

  // Suggestions: templates from plan not yet logged today
  const unloggedSuggestions = suggestedIds
    .filter(id => !todayEntryTemplateIds.includes(id))
    .map(id => templates.find(t => t.id === id))
    .filter(Boolean) as MealTemplate[]

  const dateLabel = new Date(today + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

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
              { label: 'Proteína', val: Math.round(totals.protein_g), color: 'text-[#60a5fa]' },
              { label: 'Carboidratos', val: Math.round(totals.carbs_g), color: 'text-[#f97316]' },
              { label: 'Gordura', val: Math.round(totals.fat_g), color: 'text-[#a78bfa]' },
              { label: 'Fibra', val: Math.round(totals.fiber_g), color: 'text-[#14b8a6]' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-[#0f0f0f] rounded-xl p-2 text-center">
                <p className={`text-sm font-bold ${color}`}>{val}g</p>
                <p className="text-[9px] text-[#525252] leading-tight mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's entries */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold">Registado hoje</p>
          {entries.map(entry => {
            const m = entryMacros(entry)
            const catLabel = MEAL_CATEGORIES.find(c => c.id === entry.category)?.label
            return (
              <div key={entry.id} className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white truncate">{entry.name}</p>
                      <span className="text-sm font-bold text-white flex-shrink-0">{Math.round(m.calories)} kcal</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#525252]">{catLabel}</span>
                      {entry.time && (
                        <span className="flex items-center gap-0.5 text-[10px] text-[#525252]">
                          <Clock size={9} />{entry.time}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <MacroBar macros={m} compact />
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] text-[#60a5fa]">P {Math.round(m.protein_g)}g</span>
                      <span className="text-[10px] text-[#f97316]">C {Math.round(m.carbs_g)}g</span>
                      <span className="text-[10px] text-[#a78bfa]">G {Math.round(m.fat_g)}g</span>
                    </div>
                  </div>
                  <button onClick={() => removeEntry(entry.id)} className="p-1.5 text-[#525252] hover:text-red-400 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Plan suggestions */}
      {unloggedSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold">Sugerido pelo plano</p>
          {unloggedSuggestions.map(t => {
            const m = entryMacros(t)
            return (
              <button key={t.id} onClick={() => setShowLogger(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#1a1a1a] rounded-2xl opacity-60 border border-dashed border-[#2e2e2e]">
                <div className="text-left">
                  <p className="text-sm text-white">{t.name}</p>
                  <p className="text-[10px] text-[#525252]">{Math.round(m.calories)} kcal · {MEAL_CATEGORIES.find(c => c.id === t.category)?.label}</p>
                </div>
                <Plus size={16} className="text-[#525252]" />
              </button>
            )
          })}
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
