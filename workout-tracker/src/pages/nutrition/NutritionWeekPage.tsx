import { useState } from 'react'
import { ShoppingCart, Apple, UtensilsCrossed, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { NutritionPlan, MealTemplate } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { getActivePlan, getWeekDates, templateMacros, generateShoppingItems } from '../../utils/nutrition'
import { useShoppingStore } from '../../hooks/useShoppingStore'
import ShoppingListOverlay from '../../components/nutrition/ShoppingListOverlay'

interface Props {
  today: string
  plans: NutritionPlan[]
  templates: MealTemplate[]
  weekStartDay: 0 | 1
}

export default function NutritionWeekPage({ today, plans, templates, weekStartDay }: Props) {
  const [showShopping, setShowShopping] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const { list, toggleItem, addManualItem, deleteItem, regenerate } = useShoppingStore()

  const activePlan = getActivePlan(plans)

  const anchorDate = new Date(today + 'T12:00:00')
  anchorDate.setDate(anchorDate.getDate() + weekOffset * 7)
  const anchor = anchorDate.toISOString().slice(0, 10)

  const weekDates = getWeekDates(anchor, weekStartDay)
  const weekStart = new Date(weekDates[0] + 'T12:00:00')
  const weekEnd = new Date(weekDates[6] + 'T12:00:00')
  const weekLabel = `${weekStart.getDate()} ${weekStart.toLocaleDateString('pt-PT', { month: 'short' })} – ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('pt-PT', { month: 'short' })}`

  const inStockNames = new Set(list.items.filter(i => i.inStock).map(i => i.name.toLowerCase().trim()))

  function templateReadiness(t: MealTemplate): 'ready' | 'missing' | 'unknown' {
    if (list.items.length === 0) return 'unknown'
    const names = t.foods.map(f => f.name.toLowerCase().trim())
    if (names.length === 0) return 'unknown'
    return names.every(n => inStockNames.has(n)) ? 'ready' : 'missing'
  }

  const handleRegenerate = () => {
    if (!activePlan) return
    regenerate(generateShoppingItems(activePlan, templates, weekDates), activePlan.id)
  }

  const needCount = list.items.filter(i => !i.inStock).length

  if (showShopping) {
    return (
      <ShoppingListOverlay
        list={list}
        canRegenerate={!!activePlan}
        onToggle={toggleItem}
        onAdd={addManualItem}
        onDelete={deleteItem}
        onRegenerate={handleRegenerate}
        onClose={() => setShowShopping(false)}
      />
    )
  }

  if (!activePlan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-2">
        <p className="text-white font-semibold">Sem plano ativo</p>
        <p className="text-[#737373] text-sm">Ativa um plano no separador Planos para ver a semana.</p>
      </div>
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

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-2">
        {weekDates.map(date => {
          const isToday = date === today
          const dow = new Date(date + 'T12:00:00').getDay()
          const planDay = activePlan.days.find(d => d.day_of_week === dow)
          const dayTemplates = (planDay?.template_ids ?? [])
            .map(id => templates.find(t => t.id === id))
            .filter(Boolean) as MealTemplate[]
          const totalKcal = dayTemplates.reduce((s, t) => s + templateMacros(t).calories, 0)
          const byCategory = MEAL_CATEGORIES
            .map(cat => ({ cat, items: dayTemplates.filter(t => t.category === cat.id) }))
            .filter(g => g.items.length > 0)
          const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })

          return (
            <div key={date} className={`rounded-2xl overflow-hidden ${isToday ? 'ring-1 ring-[#22c55e]' : ''}`}>
              <div className={`flex items-center justify-between px-4 py-2.5 ${isToday ? 'bg-[#0f2318]' : 'bg-[#1a1a1a]'}`}>
                <div className="flex items-center gap-2">
                  {isToday && <span className="text-[9px] bg-[#22c55e] text-black font-bold px-1.5 py-0.5 rounded-full">HOJE</span>}
                  <p className={`text-sm font-semibold capitalize ${isToday ? 'text-[#22c55e]' : 'text-white'}`}>{dateLabel}</p>
                </div>
                <p className="text-xs text-[#737373]">{dayTemplates.length === 0 ? 'Livre' : `${Math.round(totalKcal)} kcal`}</p>
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
    </div>
  )
}
