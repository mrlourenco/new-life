import { useState } from 'react'
import { X, Search, Clock, ChevronDown, ChevronUp, Plus, Apple, UtensilsCrossed } from 'lucide-react'
import type { MealTemplate, MealEntry, MealCategory, DayNutritionLog, FoodItem } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import { templateMacros, entryMacros } from '../../utils/nutrition'
import MacroBar from './MacroBar'
import FoodPicker from './FoodPicker'

interface Props {
  today: string
  templates: MealTemplate[]
  logs: DayNutritionLog[]
  suggestedIds: string[]
  todayEntryIds: string[]
  onLog: (entry: MealEntry) => void
  onSaveTemplate?: (t: MealTemplate) => void
  onClose: () => void
}

type View = 'list' | 'configure' | 'new-food' | 'new-recipe'

function TemplateSection({ title, items, sectionKey, expandedSection, onToggle, todayEntryIds, onSelect }: {
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

export default function MealEntryLogger({ today, templates, logs, suggestedIds, todayEntryIds, onLog, onSaveTemplate, onClose }: Props) {
  const [view, setView] = useState<View>('list')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<MealTemplate | null>(null)
  const [time, setTime] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('suggested')

  // new-food (alimento avulso)
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null)
  const [foodCategory, setFoodCategory] = useState<MealCategory>('outro')
  const [foodTime, setFoodTime] = useState('')
  const [showFoodPickerForFood, setShowFoodPickerForFood] = useState(false)

  // new-recipe (receita avulsa)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<MealCategory>('outro')
  const [newTime, setNewTime] = useState('')
  const [newFoods, setNewFoods] = useState<FoodItem[]>([])
  const [showFoodPickerForRecipe, setShowFoodPickerForRecipe] = useState(false)
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
    onLog({ id: crypto.randomUUID(), template_id: selected.id, name: selected.name, category: selected.category, time: time || undefined, foods: [...selected.foods] })
    onClose()
  }

  const handleLogFood = () => {
    if (!foodItem) return
    onLog({ id: crypto.randomUUID(), name: foodItem.name, category: foodCategory, time: foodTime || undefined, foods: [foodItem] })
    onClose()
  }

  const handleLogRecipe = () => {
    if (!newName.trim() || newFoods.length === 0) return
    const entry: MealEntry = { id: crypto.randomUUID(), name: newName.trim(), category: newCategory, time: newTime || undefined, foods: newFoods }
    if (saveToLib && onSaveTemplate) {
      const t: MealTemplate = { id: crypto.randomUUID(), type: 'recipe', name: newName.trim(), category: newCategory, foods: newFoods }
      onSaveTemplate(t)
      entry.template_id = t.id
    }
    onLog(entry)
    onClose()
  }

  // ── food picker for alimento avulso ─────────────────────────────
  if (showFoodPickerForFood) {
    return (
      <FoodPicker
        onAdd={f => { setFoodItem(f); setFoodCategory('outro'); setShowFoodPickerForFood(false) }}
        onClose={() => { setShowFoodPickerForFood(false); if (!foodItem) setView('list') }}
      />
    )
  }

  // ── food picker for receita avulsa ───────────────────────────────
  if (showFoodPickerForRecipe) {
    return <FoodPicker onAdd={f => { setNewFoods(prev => [...prev, f]); setShowFoodPickerForRecipe(false) }} onClose={() => setShowFoodPickerForRecipe(false)} />
  }

  // ── configure template ───────────────────────────────────────────
  if (view === 'configure' && selected) {
    const macros = templateMacros(selected)
    const isFood = (selected.type ?? 'recipe') === 'food'
    return (
      <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
          <button onClick={() => setView('list')} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isFood ? <Apple size={14} className="text-[#22c55e] flex-shrink-0" /> : <UtensilsCrossed size={14} className="text-[#60a5fa] flex-shrink-0" />}
            <h2 className="text-white font-semibold truncate">{selected.name}</h2>
          </div>
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
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="flex-1 bg-transparent text-white text-sm outline-none" />
            </div>
          </div>
          <button onClick={handleConfirm} className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold">
            Registar {isFood ? 'alimento' : 'receita'}
          </button>
        </div>
      </div>
    )
  }

  // ── new-food view (alimento avulso) ──────────────────────────────
  if (view === 'new-food') {
    if (!foodItem) {
      // auto-open picker
      setShowFoodPickerForFood(true)
      return null
    }
    return (
      <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
          <button onClick={() => setView('list')} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
          <h2 className="text-white font-semibold flex-1">Alimento avulso</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
          {/* Food preview */}
          <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
            <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-1.5">Alimento</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{foodItem.name}</p>
                <p className="text-[10px] text-[#525252] mt-0.5">{foodItem.quantity} · {Math.round(foodItem.calories)} kcal</p>
                <div className="flex gap-3 mt-1">
                  {foodItem.protein_g != null && <span className="text-[10px] text-[#60a5fa]">P {foodItem.protein_g}g</span>}
                  {foodItem.carbs_g != null && <span className="text-[10px] text-[#f97316]">C {foodItem.carbs_g}g</span>}
                  {foodItem.fat_g != null && <span className="text-[10px] text-[#a78bfa]">G {foodItem.fat_g}g</span>}
                </div>
              </div>
              <button onClick={() => { setFoodItem(null); setShowFoodPickerForFood(true) }}
                className="text-[10px] text-[#525252] hover:text-[#a3a3a3] border border-[#2e2e2e] rounded-lg px-2 py-1">
                Mudar
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-1.5">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {MEAL_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setFoodCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${foodCategory === cat.id ? 'bg-[#22c55e] text-black' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3">
            <Clock size={14} className="text-[#525252]" />
            <input type="time" value={foodTime} onChange={e => setFoodTime(e.target.value)}
              placeholder="Hora" className="flex-1 bg-transparent text-white text-sm outline-none" />
          </div>

          <button onClick={handleLogFood} className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold">
            Registar alimento
          </button>
        </div>
      </div>
    )
  }

  // ── new-recipe view (receita avulsa) ─────────────────────────────
  if (view === 'new-recipe') {
    const preview = { id: '', name: '', category: newCategory, foods: newFoods }
    const macros = entryMacros(preview)
    return (
      <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
          <button onClick={() => setView('list')} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
          <h2 className="text-white font-semibold flex-1">Receita avulsa</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da receita *" autoFocus
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
          <button onClick={() => setShowFoodPickerForRecipe(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-xl text-[#22c55e] text-sm border border-[#22c55e]/30">
            <Plus size={16} />Adicionar alimento
          </button>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={saveToLib} onChange={e => setSaveToLib(e.target.checked)} className="w-4 h-4 rounded accent-[#22c55e]" />
            <span className="text-sm text-[#a3a3a3]">Guardar na biblioteca</span>
          </label>
          <button onClick={handleLogRecipe} disabled={!newName.trim() || newFoods.length === 0}
            className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold disabled:opacity-40">
            Registar receita
          </button>
        </div>
      </div>
    )
  }

  // ── list view ────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="text-white font-semibold flex-1">Registar</h2>
      </div>

      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
          <Search size={15} className="text-[#525252]" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Pesquisar alimento ou receita..."
            className="flex-1 bg-transparent text-white text-sm placeholder-[#525252] outline-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-1">
        {templates.length === 0 ? (
          <p className="text-center text-[#525252] text-sm py-8">Biblioteca vazia. Usa a entrada avulso abaixo.</p>
        ) : (
          <>
            <TemplateSection title="Sugeridas hoje" items={filtered(suggested)} sectionKey="suggested"
              expandedSection={expandedSection} onToggle={setExpandedSection} todayEntryIds={todayEntryIds} onSelect={handleSelect} />
            <TemplateSection title="Recentes" items={filtered(recent)} sectionKey="recent"
              expandedSection={expandedSection} onToggle={setExpandedSection} todayEntryIds={todayEntryIds} onSelect={handleSelect} />
            <TemplateSection title="Biblioteca" items={filtered(rest)} sectionKey="all"
              expandedSection={expandedSection} onToggle={setExpandedSection} todayEntryIds={todayEntryIds} onSelect={handleSelect} />
          </>
        )}

        {/* Two avulso buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button onClick={() => { setFoodItem(null); setView('new-food'); setShowFoodPickerForFood(true) }}
            className="flex items-center justify-center gap-1.5 py-3 bg-[#1a1a1a] rounded-xl text-[#22c55e] text-xs font-semibold border border-[#22c55e]/30 hover:border-[#22c55e]/60">
            <Apple size={13} />Alimento avulso
          </button>
          <button onClick={() => setView('new-recipe')}
            className="flex items-center justify-center gap-1.5 py-3 bg-[#1a1a1a] rounded-xl text-[#60a5fa] text-xs font-semibold border border-[#60a5fa]/30 hover:border-[#60a5fa]/60">
            <UtensilsCrossed size={13} />Receita avulsa
          </button>
        </div>
      </div>
    </div>
  )
}
