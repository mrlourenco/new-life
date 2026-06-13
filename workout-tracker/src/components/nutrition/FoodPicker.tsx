import { useState, useRef, useEffect } from 'react'
import { X, Search, ChevronRight } from 'lucide-react'
import type { FoodItem } from '../../types/nutrition'
import { searchFoods, calcMacros, type FoodEntry } from '../../data/foods'

interface Props {
  onAdd: (food: FoodItem) => void
  onClose: () => void
  initialMode?: Mode
}

type Mode = 'search' | 'portion' | 'manual'

const EMPTY_MANUAL: FoodItem = { name: '', quantity: '', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }

export default function FoodPicker({ onAdd, onClose, initialMode = 'search' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<FoodEntry | null>(null)
  const [grams, setGrams] = useState('')
  const [manual, setManual] = useState<FoodItem>(EMPTY_MANUAL)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  const results = searchFoods(query)

  const portionCalc = selected && grams
    ? calcMacros(selected, parseFloat(grams) || 0)
    : null

  const handleSelectFood = (food: FoodEntry) => {
    setSelected(food)
    setGrams(String(food.defaultPortionG))
    setMode('portion')
  }

  const handleAddFromDB = () => {
    if (!selected || !grams) return
    const g = parseFloat(grams)
    if (!g || g <= 0) return
    const m = calcMacros(selected, g)
    onAdd({
      name: selected.name,
      quantity: `${g}g`,
      calories: m.calories,
      protein_g: m.protein_g,
      carbs_g: m.carbs_g,
      fat_g: m.fat_g,
      fiber_g: m.fiber_g,
    })
  }

  const handleAddManual = () => {
    if (!manual.name.trim() || !manual.calories) return
    onAdd({ ...manual, quantity: manual.quantity || '100g' })
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={mode === 'search' || mode === 'manual' ? onClose : () => setMode('search')} className="p-1 text-[#a3a3a3]">
          <X size={20} />
        </button>
        <h2 className="text-white font-semibold flex-1">
          {mode === 'search' && 'Adicionar alimento'}
          {mode === 'portion' && (selected?.name ?? '')}
          {mode === 'manual' && 'Entrada manual'}
        </h2>
      </div>

      {/* Mode: Search */}
      {mode === 'search' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Search input */}
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
              <Search size={16} className="text-[#525252] flex-shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Pesquisar alimento..."
                className="flex-1 bg-transparent text-white text-sm placeholder-[#525252] outline-none"
              />
            </div>
          </div>

          {/* Manual entry button */}
          <button
            onClick={() => setMode('manual')}
            className="mx-4 mt-3 mb-1 py-2.5 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#22c55e]/50"
          >
            Entrada manual
          </button>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 mt-2">
            {results.length === 0 ? (
              <p className="text-center text-[#525252] text-sm py-8">Sem resultados</p>
            ) : (
              <div className="space-y-1">
                {results.map(food => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="w-full flex items-center justify-between px-3 py-3 bg-[#1a1a1a] rounded-xl text-left hover:bg-[#222]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{food.name}</p>
                      <p className="text-[10px] text-[#525252] mt-0.5">
                        {food.defaultPortionLabel} · {Math.round(food.per100g.calories * food.defaultPortionG / 100)} kcal
                        {' · '}P {Math.round(food.per100g.protein_g * food.defaultPortionG / 100)}g
                        {' · '}C {Math.round(food.per100g.carbs_g * food.defaultPortionG / 100)}g
                        {' · '}G {Math.round(food.per100g.fat_g * food.defaultPortionG / 100)}g
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-[#525252] flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode: Portion selector */}
      {mode === 'portion' && selected && (
        <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-4 pb-6 gap-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-4">
            <p className="text-xs text-[#737373] mb-1">Porção padrão</p>
            <p className="text-sm text-[#a3a3a3]">{selected.defaultPortionLabel}</p>
          </div>

          {/* Quantity input */}
          <div>
            <label className="text-xs text-[#737373] uppercase tracking-wider font-semibold block mb-2">
              Quantidade (gramas)
            </label>
            <input
              type="number"
              value={grams}
              onChange={e => setGrams(e.target.value)}
              placeholder="ex: 100"
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#22c55e]"
              autoFocus
            />
          </div>

          {/* Preview */}
          {portionCalc && parseFloat(grams) > 0 && (
            <div className="bg-[#1a1a1a] rounded-2xl p-4">
              <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-3">Valores nutricionais</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0f0f0f] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-white">{Math.round(portionCalc.calories)}</p>
                  <p className="text-[10px] text-[#525252]">kcal</p>
                </div>
                <div className="bg-[#0f0f0f] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#60a5fa]">{portionCalc.protein_g}g</p>
                  <p className="text-[10px] text-[#525252]">Proteína</p>
                </div>
                <div className="bg-[#0f0f0f] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#f97316]">{portionCalc.carbs_g}g</p>
                  <p className="text-[10px] text-[#525252]">Carboidratos</p>
                </div>
                <div className="bg-[#0f0f0f] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#a78bfa]">{portionCalc.fat_g}g</p>
                  <p className="text-[10px] text-[#525252]">Gordura</p>
                </div>
                {portionCalc.fiber_g > 0 && (
                  <div className="bg-[#0f0f0f] rounded-xl p-3 text-center col-span-2">
                    <p className="text-lg font-bold text-[#14b8a6]">{portionCalc.fiber_g}g</p>
                    <p className="text-[10px] text-[#525252]">Fibra</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-[10px] text-[#525252] text-center">
            Valores por 100g: {selected.per100g.calories} kcal · P {selected.per100g.protein_g}g · C {selected.per100g.carbs_g}g · G {selected.per100g.fat_g}g
          </p>

          <button
            onClick={handleAddFromDB}
            disabled={!grams || parseFloat(grams) <= 0}
            className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold disabled:opacity-40"
          >
            Adicionar ao plano
          </button>
        </div>
      )}

      {/* Mode: Manual entry */}
      {mode === 'manual' && (
        <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-4 pb-6 gap-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-[#737373]">Preenche os valores nutricionais manualmente.</p>
            <button onClick={() => setMode('search')} className="text-xs text-[#22c55e] font-medium flex-shrink-0">Pesquisar →</button>
          </div>

          {[
            { field: 'name', label: 'Nome do alimento *', type: 'text', placeholder: 'ex: Arroz basmati' },
            { field: 'quantity', label: 'Quantidade', type: 'text', placeholder: 'ex: 100g, 1 fatia' },
            { field: 'calories', label: 'Calorias (kcal) *', type: 'number', placeholder: '0' },
            { field: 'protein_g', label: 'Proteína (g)', type: 'number', placeholder: '0' },
            { field: 'carbs_g', label: 'Carboidratos (g)', type: 'number', placeholder: '0' },
            { field: 'fat_g', label: 'Gordura (g)', type: 'number', placeholder: '0' },
            { field: 'fiber_g', label: 'Fibra (g)', type: 'number', placeholder: '0' },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="text-xs text-[#737373] block mb-1.5">{label}</label>
              <input
                type={type}
                value={(manual as unknown as Record<string, unknown>)[field] as string}
                onChange={e => setManual(prev => ({ ...prev, [field]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]"
              />
            </div>
          ))}

          <button
            onClick={handleAddManual}
            disabled={!manual.name.trim() || !manual.calories}
            className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold disabled:opacity-40 mt-2"
          >
            Adicionar ao plano
          </button>
        </div>
      )}
    </div>
  )
}
