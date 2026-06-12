import { useState } from 'react'
import { X, Search, Clock, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import type { MealTemplate, MealEntry, MealCategory, DayNutritionLog, FoodItem } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { templateMacros, entryMacros } from '../../utils/nutrition'
import MacroBar from './MacroBar'
import FoodPicker from './FoodPicker'

interface Props {
  today: string
  templates: MealTemplate[]
  logs: DayNutritionLog[]
  suggestedIds: string[]     // from active plan for today
  todayEntryIds: string[]    // template_ids already logged today
  onLog: (entry: MealEntry) => void
  onSaveTemplate?: (t: MealTemplate) => void
  onClose: () => void
}

type View = 'list' | 'configure' | 'new-entry'

export default function MealEntryLogger({ today, templates, logs, suggestedIds, todayEntryIds, onLog, onSaveTemplate, onClose }: Props) {
  const [view, setView] = useState<View>('list')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<MealTemplate | null>(null)
  const [time, setTime] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('suggested')

  // one-off new entry state
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<MealCategory>('outro')
  const [newTime, setNewTime] = useState('')
  const [newFoods, setNewFoods] = useState<FoodItem[]>([])
  const [showFoodPicker, setShowFoodPicker] = useState(false)
  const [saveToLib, setSaveToLib] = useState(false)

  // Recent unique templates used in last 7 days (not today)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysStr = sevenDaysAgo.toISOString().slice(0, 10)
  const recentIds = new Set(
    logs
      .filter(l => l.date >= sevenDaysStr && l.date < today)
      .flatMap(l => l.entries.map(e => e.template_id).filter(Boolean) as string[])
  )

  const suggested = templates.filter(t => suggestedIds.includes(t.id))
  const recent = templates.filter(t => recentIds.has(t.id) && !suggestedIds.includes(t.id))
  const rest = templates.filter(t => !suggestedIds.includes(t.id) && !recentIds.has(t.id))

  const filtered = (list: MealTemplate[]) =>
    query ? list.filter(t => t.name.toLowerCase().includes(query.toLowerCase())) : list

  const handleSelect = (t: MealTemplate) => {
    const cat = MEAL_CATEGORIES.find(c => c.id === t.category)
    setSelected(t)
    setTime(cat?.defaultTime ?? '')
    setView('configure')
  }

  const handleConfirm = () => {
    if (!selected) return
    onLog({
      id: crypto.randomUUID(),
      template_id: selected.id,
      name: selected.name,
      category: selected.category,
      time: time || undefined,
      foods: [...selected.foods],
    })
    onClose()
  }

  const handleLogNew = () => {
    if (!newName.trim() || newFoods.length === 0) return
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      category: newCategory,
      time: newTime || undefined,
      foods: newFoods,
    }
    if (saveToLib && onSaveTemplate) {
      const t: MealTemplate = { id: crypto.randomUUID(), name: newName.trim(), category: newCategory, foods: newFoods }
      onSaveTemplate(t)
      entry.template_id = t.id
    }
    onLog(entry)
    onClose()
  }

  if (showFoodPicker) {
    return <FoodPicker onAdd={f => { setNewFoods(prev => [...prev, f]); setShowFoodPicker(false) }} onClose={() => setShowFoodPicker(false)} />
  }

  if (view === 'configure' && selected) {
    const macros = templateMacros(selected)
    return (
      <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
          <button onClick={() => setView('list')} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
          <h2 className="text-white font-semibold flex-1 truncate">{selected.name}</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">{MEAL_CATEGORIES.find(c => c.id === selected.category)?.label}</p>
              <p className="text-sm font-bold text-white">{Math.round(macros.calories)} kcal</p>
            </div>
            <MacroBar macros={macros} compact />
            <div className="flex gap-3 mt-2">
              <span className="text-[10px] text-[#60a5fa]">P {Math.round(macros.protein_g)}g</span>
              <span className="text-[10px] text-[#f97316]">C {Math.round(macros.carbs_g)}g</span>
              <span className="text-[10px] text-[#a78bfa]">G {Math.round(macros.fat_g)}g</span>
            </div>
          </div>

          {selected.notes && <p className="text-xs text-[#737373] italic">"{selected.notes}"</p>}

          <div className="space-y-1.5">
            {selected.foods.map((f, i) => (
              <div key={i} className="flex justify-between text-xs bg-[#1a1a1a] rounded-xl px-3 py-2">
                <span className="text-[#a3a3a3]">{f.name} <span className="text-[#525252]">({f.quantity})</span></span>
                <span className="text-[#737373]">{Math.round(f.calories)} kcal</span>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-1.5">Hora (opcional)</label>
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3">
              <Clock size={14} className="text-[#525252]" />
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm outline-none" />
            </div>
          </div>

          <button onClick={handleConfirm}
            className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold">
            Registar refeição
          </button>
        </div>
      </div>
    )
  }

  if (view === 'new-entry') {
    const preview = { id: '', name: '', category: newCategory, foods: newFoods }
    const macros = entryMacros(preview)
    return (
      <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
          <button onClick={() => setView('list')} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
          <h2 className="text-white font-semibold flex-1">Registar refeição avulso</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da refeição *" autoFocus
            className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]" />

          <div className="flex flex-wrap gap-2">
            {MEAL_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setNewCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${newCategory === cat.id ? 'bg-[#22c55e] text-black' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3">
            <Clock size={14} className="text-[#525252]" />
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
              placeholder="Hora" className="flex-1 bg-transparent text-white text-sm outline-none" />
          </div>

          {newFoods.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-2xl p-3 space-y-1.5">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#737373]">Total</span>
                <span className="font-bold text-white">{Math.round(macros.calories)} kcal</span>
              </div>
              {newFoods.map((f, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-[#a3a3a3]">{f.name} ({f.quantity})</span>
                  <span className="text-[#737373]">{Math.round(f.calories)} kcal</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => setShowFoodPicker(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-xl text-[#22c55e] text-sm border border-[#22c55e]/30">
            <Plus size={16} />Adicionar alimento
          </button>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={saveToLib} onChange={e => setSaveToLib(e.target.checked)}
              className="w-4 h-4 rounded accent-[#22c55e]" />
            <span className="text-sm text-[#a3a3a3]">Guardar na biblioteca de refeições</span>
          </label>

          <button onClick={handleLogNew} disabled={!newName.trim() || newFoods.length === 0}
            className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold disabled:opacity-40">
            Registar
          </button>
        </div>
      </div>
    )
  }

  // List view
  function Section({ title, items, key: k }: { title: string; items: MealTemplate[]; key: string }) {
    const open = expandedSection === k
    if (filtered(items).length === 0) return null
    return (
      <div>
        <button onClick={() => setExpandedSection(open ? null : k)}
          className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#737373] uppercase tracking-wider">
          <span>{title} ({filtered(items).length})</span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {open && (
          <div className="space-y-1.5">
            {filtered(items).map(t => {
              const m = templateMacros(t)
              const alreadyLogged = todayEntryIds.includes(t.id)
              return (
                <button key={t.id} onClick={() => handleSelect(t)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left ${alreadyLogged ? 'bg-[#0f2318]' : 'bg-[#1a1a1a] hover:bg-[#222]'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{t.name}</p>
                      {alreadyLogged && <span className="text-[10px] text-[#4ade80] flex-shrink-0">✓</span>}
                    </div>
                    <p className="text-[10px] text-[#525252] mt-0.5">
                      {MEAL_CATEGORIES.find(c => c.id === t.category)?.label} · {Math.round(m.calories)} kcal
                      · P {Math.round(m.protein_g)}g · C {Math.round(m.carbs_g)}g
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

  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="text-white font-semibold flex-1">Registar refeição</h2>
      </div>

      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
          <Search size={15} className="text-[#525252]" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Pesquisar refeição..."
            className="flex-1 bg-transparent text-white text-sm placeholder-[#525252] outline-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-1">
        {templates.length === 0 ? (
          <p className="text-center text-[#525252] text-sm py-8">Sem refeições na biblioteca. Cria refeições no separador Refeições ou usa a entrada avulso.</p>
        ) : (
          <>
            <Section title="Sugeridas hoje" items={suggested} key="suggested" />
            <Section title="Recentes" items={recent} key="recent" />
            <Section title="Biblioteca" items={rest} key="all" />
          </>
        )}
        <button onClick={() => setView('new-entry')}
          className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#22c55e]/50">
          <Plus size={15} />Registar refeição avulso
        </button>
      </div>
    </div>
  )
}
