import { useState } from 'react'
import { X, Plus, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react'
import type { NutritionPlan, MealTemplate } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { templateMacros, GOAL_PT, dowLabel } from '../../utils/nutrition'

interface Props {
  templates: MealTemplate[]
  onSave: (plan: NutritionPlan) => void
  onCancel: () => void
}

const GOALS = Object.entries(GOAL_PT) as [string, string][]
const DAYS = [1, 2, 3, 4, 5, 6, 0] // Mon–Sun

export default function NutritionPlanBuilder({ templates, onSave, onCancel }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState<NutritionPlan['goal']>('general')
  const [target, setTarget] = useState('')
  const [days, setDays] = useState<Record<number, string[]>>(
    Object.fromEntries(DAYS.map(d => [d, []]))
  )
  const [selectingDay, setSelectingDay] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

  const addTemplate = (dow: number, id: string) => {
    setDays(prev => ({ ...prev, [dow]: [...(prev[dow] ?? []), id] }))
    setSelectingDay(null)
    setSearchQuery('')
  }

  const removeTemplate = (dow: number, idx: number) => {
    setDays(prev => ({ ...prev, [dow]: prev[dow].filter((_, i) => i !== idx) }))
  }

  const handleSave = () => {
    if (!name.trim()) return
    const plan: NutritionPlan = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description || undefined,
      goal,
      daily_calories_target: target ? parseInt(target) : undefined,
      days: DAYS.filter(d => (days[d] ?? []).length > 0).map(d => ({ day_of_week: d, template_ids: days[d] })),
    }
    onSave(plan)
  }

  // Template selector overlay
  if (selectingDay !== null) {
    const available = templates.filter(t => !days[selectingDay]?.includes(t.id))
    const filtered = searchQuery
      ? available.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : available
    const byCategory = MEAL_CATEGORIES.reduce((acc, cat) => {
      const items = filtered.filter(t => t.category === cat.id)
      if (items.length) acc.push({ cat, items })
      return acc
    }, [] as { cat: typeof MEAL_CATEGORIES[0]; items: MealTemplate[] }[])

    return (
      <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
          <button onClick={() => { setSelectingDay(null); setSearchQuery('') }} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
          <h2 className="text-white font-semibold flex-1">Adicionar a {dowLabel(selectingDay)}</h2>
        </div>
        <div className="px-4 py-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
            <Search size={15} className="text-[#525252]" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Pesquisar..."
              className="flex-1 bg-transparent text-white text-sm placeholder-[#525252] outline-none" autoFocus />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {filtered.length === 0 && <p className="text-center text-[#525252] text-sm py-8">Sem refeições disponíveis. Cria refeições no separador Refeições.</p>}
          {byCategory.map(({ cat, items }) => (
            <div key={cat.id}>
              <p className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold mb-2">{cat.label}</p>
              <div className="space-y-1.5">
                {items.map(t => {
                  const m = templateMacros(t)
                  return (
                    <button key={t.id} onClick={() => addTemplate(selectingDay, t.id)}
                      className="w-full flex items-center justify-between px-3 py-3 bg-[#1a1a1a] rounded-xl text-left hover:bg-[#222]">
                      <div>
                        <p className="text-sm text-white font-medium">{t.name}</p>
                        <p className="text-[10px] text-[#525252]">{Math.round(m.calories)} kcal · P {Math.round(m.protein_g)}g · C {Math.round(m.carbs_g)}g</p>
                      </div>
                      <Plus size={16} className="text-[#22c55e] flex-shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={step === 1 ? onCancel : () => setStep(1)} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="text-white font-semibold flex-1">Novo plano — Passo {step}/2</h2>
        {step === 2 && (
          <button onClick={handleSave} disabled={!name.trim()}
            className="px-4 py-1.5 bg-[#22c55e] rounded-lg text-white text-sm font-semibold disabled:opacity-40">
            Criar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-1.5">Nome do plano *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Plano de definição" autoFocus
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]" />
            </div>
            <div>
              <label className="text-xs text-[#737373] block mb-1.5">Descrição (opcional)</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="ex: Foco em proteína e défice calórico"
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]" />
            </div>
            <div>
              <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-2">Objetivo</label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(([key, label]) => (
                  <button key={key} onClick={() => setGoal(key as NutritionPlan['goal'])}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${goal === key ? 'bg-[#22c55e] text-black' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[#737373] block mb-1.5">Calorias diárias alvo (opcional)</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="ex: 1800"
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]" />
            </div>
            <button onClick={() => setStep(2)} disabled={!name.trim()}
              className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold disabled:opacity-40">
              Seguinte → Associar refeições
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <p className="text-xs text-[#737373] mb-4">
              Associa refeições da biblioteca a cada dia da semana. Podes associar 0 ou mais refeições por dia.
            </p>
            {DAYS.map(dow => {
              const ids = days[dow] ?? []
              const dayTemplates = ids.map(id => templates.find(t => t.id === id)).filter(Boolean) as MealTemplate[]
              const dayKcal = dayTemplates.reduce((acc, t) => acc + templateMacros(t).calories, 0)
              const isOpen = expandedDay === dow

              return (
                <div key={dow} className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                  <button onClick={() => setExpandedDay(isOpen ? null : dow)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left">
                    <div>
                      <p className="text-sm font-semibold text-white">{dowLabel(dow)}</p>
                      <p className="text-[10px] text-[#525252]">
                        {ids.length === 0 ? 'Sem refeições' : `${ids.length} refeições · ${Math.round(dayKcal)} kcal`}
                      </p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-[#525252]" /> : <ChevronDown size={16} className="text-[#525252]" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#2e2e2e] px-4 pb-3 pt-2 space-y-2">
                      {dayTemplates.map((t, i) => {
                        const m = templateMacros(t)
                        return (
                          <div key={i} className="flex items-center gap-2 bg-[#0f0f0f] rounded-xl px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white font-medium truncate">{t.name}</p>
                              <p className="text-[10px] text-[#525252]">{Math.round(m.calories)} kcal</p>
                            </div>
                            <button onClick={() => removeTemplate(dow, i)} className="p-1 text-[#525252] hover:text-red-400">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )
                      })}
                      <button onClick={() => setSelectingDay(dow)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] text-[#22c55e] border border-[#22c55e]/30 hover:border-[#22c55e]/60">
                        <Plus size={12} />Adicionar refeição
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
