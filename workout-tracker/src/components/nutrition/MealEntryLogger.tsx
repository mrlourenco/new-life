import { useState } from 'react'
import { X, Search, Apple, UtensilsCrossed } from 'lucide-react'
import type { MealTemplate, MealEntry, MealCategory, DayNutritionLog, FoodItem } from '../../types/nutrition'
import { MEAL_CATEGORIES } from '../../types/nutrition'
import FoodPicker from './FoodPicker'
import TemplateSection from './TemplateSection'
import MealConfigureView from './MealConfigureView'
import MealNewFoodView from './MealNewFoodView'
import MealNewRecipeView from './MealNewRecipeView'

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
        initialMode="manual"
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
    return (
      <MealConfigureView
        template={selected}
        time={time}
        onTimeChange={setTime}
        onConfirm={handleConfirm}
        onBack={() => setView('list')}
      />
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
      <MealNewFoodView
        foodItem={foodItem}
        category={foodCategory}
        onCategoryChange={setFoodCategory}
        time={foodTime}
        onTimeChange={setFoodTime}
        onChangeFood={() => { setFoodItem(null); setShowFoodPickerForFood(true) }}
        onConfirm={handleLogFood}
        onBack={() => setView('list')}
      />
    )
  }

  // ── new-recipe view (receita avulsa) ─────────────────────────────
  if (view === 'new-recipe') {
    return (
      <MealNewRecipeView
        name={newName}
        onNameChange={setNewName}
        category={newCategory}
        onCategoryChange={setNewCategory}
        time={newTime}
        onTimeChange={setNewTime}
        foods={newFoods}
        saveToLib={saveToLib}
        onSaveToLibChange={setSaveToLib}
        onAddFood={() => setShowFoodPickerForRecipe(true)}
        onConfirm={handleLogRecipe}
        onBack={() => setView('list')}
      />
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
