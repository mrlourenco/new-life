import { useState } from 'react'
import {
  ShoppingCart, Apple, UtensilsCrossed, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, X, Pencil, Check, Calendar,
} from 'lucide-react'
import type { NutritionPlan, MealTemplate, WeekAssignment } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import {
  getDayTemplateIds, getWeekDates, templateMacros, generateShoppingItemsFromDayMap,
} from '../../utils/nutrition'
import { useShoppingStore } from '../../hooks/useShoppingStore'
import ShoppingListOverlay from '../../components/nutrition/ShoppingListOverlay'

interface Props {
  today: string
  plans: NutritionPlan[]
  templates: MealTemplate[]
  weekStartDay: 0 | 1
  assignments: WeekAssignment[]
  onAssignPlan: (weekStart: string, planId: string | null) => void
  onSaveDayOverride: (weekStart: string, date: string, templateIds: string[]) => void
}

function PlanPicker({ plans, currentPlanId, onSelect, onClose }: {
  plans: NutritionPlan[]
  currentPlanId?: string
  onSelect: (planId: string | null) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end" onClick={onClose}>
      <div className="bg-[#0f0f0f] rounded-t-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#1a1a1a]">
          <h3 className="text-white font-semibold">Associar plano à semana</h3>
          <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto max-h-80 px-4 py-3 space-y-2 pb-6">
          <button
            onClick={() => onSelect(null)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${!currentPlanId ? 'border-[#22c55e] bg-[#22c55e]/10' : 'border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#3f3f3f]'}`}>
            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-medium">Sem plano</p>
              {!currentPlanId && <Check size={14} className="text-[#22c55e]" />}
            </div>
            <p className="text-xs text-[#737373] mt-0.5">Planear os dias individualmente</p>
          </button>
          {plans.map(plan => (
            <button key={plan.id} onClick={() => onSelect(plan.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${currentPlanId === plan.id ? 'border-[#22c55e] bg-[#22c55e]/10' : 'border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#3f3f3f]'}`}>
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">{plan.name}</p>
                {currentPlanId === plan.id && <Check size={14} className="text-[#22c55e]" />}
              </div>
              {plan.description && <p className="text-xs text-[#737373] mt-0.5 truncate">{plan.description}</p>}
              <p className="text-xs text-[#525252] mt-0.5">{plan.days.length} dias configurados</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function DayOverrideEditor({ date, currentTemplateIds, hasOverride, templates, onSave, onClearOverride, onClose }: {
  date: string
  currentTemplateIds: string[]
  hasOverride: boolean
  templates: MealTemplate[]
  onSave: (templateIds: string[]) => void
  onClearOverride: () => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentTemplateIds))

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
  const byCategory = MEAL_CATEGORIES
    .map(cat => ({ cat, items: templates.filter(t => t.category === cat.id) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <div className="flex-1">
          <h2 className="text-white font-semibold">Planear dia</h2>
          <p className="text-xs text-[#737373] capitalize">{dateLabel}</p>
        </div>
        <button onClick={() => onSave(Array.from(selected))}
          className="px-4 py-1.5 bg-[#22c55e] rounded-xl text-black text-sm font-semibold">
          Guardar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-4">
        {hasOverride && (
          <button onClick={onClearOverride}
            className="w-full py-2.5 rounded-xl text-xs font-medium text-[#737373] border border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#f97316]/40 hover:text-[#f97316]">
            Repor para padrão do plano
          </button>
        )}

        {selected.size > 0 && (
          <p className="text-xs text-[#737373]">{selected.size} refeição(ões) selecionada(s)</p>
        )}

        {templates.length === 0 && (
          <p className="text-center text-[#525252] text-sm py-8">Sem refeições na biblioteca. Cria refeições no separador Refeições.</p>
        )}

        {byCategory.map(({ cat, items }) => (
          <div key={cat.id} className="space-y-2">
            <p className="text-[11px] text-[#525252] font-semibold uppercase tracking-wider">{cat.label}</p>
            {items.map(t => {
              const isSelected = selected.has(t.id)
              const m = templateMacros(t)
              const isFood = (t.type ?? 'recipe') === 'food'
              return (
                <button key={t.id} onClick={() => toggle(t.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${isSelected ? 'border-[#22c55e] bg-[#22c55e]/10' : 'border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#3f3f3f]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#22c55e] bg-[#22c55e]' : 'border-[#3f3f3f]'}`}>
                      {isSelected && <Check size={10} className="text-black" />}
                    </div>
                    {isFood
                      ? <Apple size={13} className="text-[#22c55e] flex-shrink-0" />
                      : <UtensilsCrossed size={13} className="text-[#60a5fa] flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[#a3a3a3]'}`}>{t.name}</p>
                      <p className="text-[10px] text-[#525252]">{Math.round(m.calories)} kcal · P {Math.round(m.protein_g)}g · C {Math.round(m.carbs_g)}g · G {Math.round(m.fat_g)}g</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NutritionWeekPage({ today, plans, templates, weekStartDay, assignments, onAssignPlan, onSaveDayOverride }: Props) {
  const [showShopping, setShowShopping] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [showPlanPicker, setShowPlanPicker] = useState(false)
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const { list, toggleItem, addManualItem, deleteItem, regenerate } = useShoppingStore()

  const anchorDate = new Date(today + 'T12:00:00')
  anchorDate.setDate(anchorDate.getDate() + weekOffset * 7)
  const anchor = anchorDate.toISOString().slice(0, 10)

  const weekDates = getWeekDates(anchor, weekStartDay)
  const weekStart = weekDates[0]
  const weekStartD = new Date(weekDates[0] + 'T12:00:00')
  const weekEnd = new Date(weekDates[6] + 'T12:00:00')
  const weekLabel = `${weekStartD.getDate()} ${weekStartD.toLocaleDateString('pt-PT', { month: 'short' })} – ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('pt-PT', { month: 'short' })}`

  const assignment = assignments.find(a => a.week_start === weekStart)
  const assignedPlan = plans.find(p => p.id === assignment?.plan_id)

  const inStockNames = new Set(list.items.filter(i => i.inStock).map(i => i.name.toLowerCase().trim()))

  function templateReadiness(t: MealTemplate): 'ready' | 'missing' | 'unknown' {
    if (list.items.length === 0) return 'unknown'
    if (t.foods.length === 0) return 'unknown'
    return t.foods.every(f => inStockNames.has(f.name.toLowerCase().trim())) ? 'ready' : 'missing'
  }

  const templateIdsByDate = weekDates.map(date => ({
    date,
    templateIds: getDayTemplateIds(date, assignments, plans, weekStartDay),
  }))

  const handleRegenerate = () => {
    const newItems = generateShoppingItemsFromDayMap(templateIdsByDate, templates, today)
    regenerate(newItems, weekStart)
  }

  const handleAssignPlan = (planId: string | null) => {
    onAssignPlan(weekStart, planId)
    setShowPlanPicker(false)
  }

  const handleSaveDayOverride = (templateIds: string[]) => {
    if (!editingDate) return
    onSaveDayOverride(weekStart, editingDate, templateIds)
    setEditingDate(null)
  }

  const handleClearDayOverride = () => {
    if (!editingDate) return
    onSaveDayOverride(weekStart, editingDate, [])
    setEditingDate(null)
  }

  const hasAnyMeals = templateIdsByDate.some(({ templateIds }) => templateIds.length > 0)
  const needCount = list.items.filter(i => !i.inStock).length

  if (showShopping) {
    return (
      <ShoppingListOverlay
        list={list}
        canRegenerate={hasAnyMeals}
        onToggle={toggleItem}
        onAdd={addManualItem}
        onDelete={deleteItem}
        onRegenerate={handleRegenerate}
        onClose={() => setShowShopping(false)}
      />
    )
  }

  if (editingDate) {
    const currentTemplateIds = getDayTemplateIds(editingDate, assignments, plans, weekStartDay)
    const hasOverride = assignment?.day_overrides.some(o => o.date === editingDate) ?? false
    return (
      <DayOverrideEditor
        date={editingDate}
        currentTemplateIds={currentTemplateIds}
        hasOverride={hasOverride}
        templates={templates}
        onSave={handleSaveDayOverride}
        onClearOverride={handleClearDayOverride}
        onClose={() => setEditingDate(null)}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Week navigation bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0f0f0f]">
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 text-[#525252] hover:text-white">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs font-semibold text-white">{weekLabel}</p>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-[10px] text-[#22c55e]">← esta semana</button>
          )}
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 text-[#525252] hover:text-white">
          <ChevronRight size={18} />
        </button>
        <button onClick={() => setShowShopping(true)}
          className="relative flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-xs border border-[#2e2e2e] hover:border-[#22c55e]/50">
          <ShoppingCart size={14} />Lista
          {needCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#22c55e] rounded-full text-[9px] font-bold text-black flex items-center justify-center">
              {needCount}
            </span>
          )}
        </button>
      </div>

      {/* Plan assignment bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar size={13} className="text-[#525252] flex-shrink-0" />
          {assignedPlan
            ? <p className="text-xs text-white font-medium truncate">{assignedPlan.name}</p>
            : <p className="text-xs text-[#525252]">Sem plano atribuído a esta semana</p>
          }
        </div>
        <button onClick={() => setShowPlanPicker(true)}
          className="text-xs text-[#22c55e] font-medium hover:text-[#4ade80] flex-shrink-0 ml-3">
          {assignedPlan ? 'Mudar' : 'Atribuir'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-2">
        {weekDates.map(date => {
          const isToday = date === today
          const { templateIds } = templateIdsByDate.find(x => x.date === date)!
          const dayTemplates = templateIds
            .map(id => templates.find(t => t.id === id))
            .filter(Boolean) as MealTemplate[]
          const totalKcal = dayTemplates.reduce((s, t) => s + templateMacros(t).calories, 0)
          const byCategory = MEAL_CATEGORIES
            .map(cat => ({ cat, items: dayTemplates.filter(t => t.category === cat.id) }))
            .filter(g => g.items.length > 0)
          const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })
          const hasOverride = assignment?.day_overrides.some(o => o.date === date) ?? false

          return (
            <div key={date} className={`rounded-2xl overflow-hidden ${isToday ? 'ring-1 ring-[#22c55e]' : ''}`}>
              <div className={`flex items-center justify-between px-4 py-2.5 ${isToday ? 'bg-[#0f2318]' : 'bg-[#1a1a1a]'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  {isToday && <span className="text-[9px] bg-[#22c55e] text-black font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">HOJE</span>}
                  {hasOverride && <span className="text-[9px] bg-[#60a5fa]/20 text-[#60a5fa] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">custom</span>}
                  <p className={`text-sm font-semibold capitalize truncate ${isToday ? 'text-[#22c55e]' : 'text-white'}`}>{dateLabel}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <p className="text-xs text-[#737373]">{dayTemplates.length === 0 ? 'Livre' : `${Math.round(totalKcal)} kcal`}</p>
                  <button onClick={() => setEditingDate(date)} className="p-1.5 text-[#525252] hover:text-[#22c55e]">
                    <Pencil size={13} />
                  </button>
                </div>
              </div>

              {byCategory.length > 0 ? (
                <div className="bg-[#131313] px-3 pb-2 pt-1 space-y-0.5">
                  {byCategory.map(({ cat, items }) => (
                    <div key={cat.id}>
                      <p className="text-[9px] text-[#3f3f3f] uppercase tracking-wider font-semibold mt-2 mb-1">{cat.label}</p>
                      {items.map(t => {
                        const m = templateMacros(t)
                        const isFood = (t.type ?? 'recipe') === 'food'
                        const readiness = templateReadiness(t)
                        return (
                          <div key={t.id} className="flex items-center gap-2 py-1">
                            {isFood
                              ? <Apple size={11} className="text-[#22c55e] flex-shrink-0" />
                              : <UtensilsCrossed size={11} className="text-[#60a5fa] flex-shrink-0" />
                            }
                            <p className="text-xs text-[#a3a3a3] flex-1 truncate">{t.name}</p>
                            <span className="text-[10px] text-[#525252] flex-shrink-0">{Math.round(m.calories)} kcal</span>
                            {readiness === 'ready' && <CheckCircle2 size={12} className="text-[#22c55e] flex-shrink-0" />}
                            {readiness === 'missing' && <AlertCircle size={12} className="text-yellow-500 flex-shrink-0" />}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#131313] px-4 py-2">
                  <p className="text-[10px] text-[#3f3f3f]">Sem refeições planeadas</p>
                </div>
              )}
            </div>
          )
        })}

        <button onClick={() => setShowShopping(true)}
          className="w-full flex items-center justify-center gap-2 py-3 mt-1 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#22c55e]/50">
          <ShoppingCart size={15} />
          {list.items.length > 0 ? `Lista de compras · ${needCount} por comprar` : 'Gerar lista de compras'}
        </button>
      </div>

      {showPlanPicker && (
        <PlanPicker
          plans={plans}
          currentPlanId={assignment?.plan_id}
          onSelect={handleAssignPlan}
          onClose={() => setShowPlanPicker(false)}
        />
      )}
    </div>
  )
}
