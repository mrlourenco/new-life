import { useState, useRef, useEffect } from 'react'
import { X, Search, ChevronRight, Wifi, WifiOff } from 'lucide-react'
import type { FoodItem } from '../../types/nutrition'
import { searchFoods, calcMacros, type FoodEntry } from '../../data/foods'
import { searchOpenFoodFacts, type OffProduct } from '../../lib/openFoodFacts'

interface Props {
  onAdd: (food: FoodItem) => void
  onClose: () => void
  initialMode?: Mode
}

type Mode = 'search' | 'portion' | 'manual'

type ManualForm = {
  name: string
  quantity: string
  calories: string
  protein_g: string
  carbs_g: string
  fat_g: string
  fiber_g: string
}

const EMPTY_MANUAL: ManualForm = {
  name: '', quantity: '', calories: '', protein_g: '', carbs_g: '', fat_g: '', fiber_g: '',
}

function offToFoodEntry(p: OffProduct): FoodEntry {
  return {
    id: `off-${p.code}`,
    name: p.brand ? `${p.name} (${p.brand})` : p.name,
    category: 'Open Food Facts',
    per100g: p.per100g,
    defaultPortionG: 100,
    defaultPortionLabel: '100g',
  }
}

export default function FoodPicker({ onAdd, onClose, initialMode = 'search' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<FoodEntry | null>(null)
  const [grams, setGrams] = useState('')
  const [manual, setManual] = useState<ManualForm>(EMPTY_MANUAL)
  const [offResults, setOffResults] = useState<OffProduct[]>([])
  const [offLoading, setOffLoading] = useState(false)
  const [offError, setOffError] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  useEffect(() => {
    if (!query.trim()) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setOffLoading(true)
      setOffError(false)
      searchOpenFoodFacts(query, controller.signal)
        .then(setOffResults)
        .catch(err => { if (err.name !== 'AbortError') setOffError(true) })
        .finally(() => setOffLoading(false))
    }, 400)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query])

  const results = searchFoods(query)

  const gramsNum = parseFloat(grams)
  const portionCalc = selected && gramsNum > 0 ? calcMacros(selected, gramsNum) : null

  const handleSelectFood = (food: FoodEntry) => {
    setSelected(food)
    setGrams(String(food.defaultPortionG))
    setMode('portion')
  }

  const handleAddFromDB = () => {
    if (!selected || !gramsNum || gramsNum <= 0) return
    const m = calcMacros(selected, gramsNum)
    onAdd({
      name: selected.name,
      quantity: `${gramsNum}g`,
      calories: m.calories,
      protein_g: m.protein_g,
      carbs_g: m.carbs_g,
      fat_g: m.fat_g,
      fiber_g: m.fiber_g,
    })
  }

  const handleAddManual = () => {
    const calories = parseFloat(manual.calories)
    if (!manual.name.trim() || !calories) return
    onAdd({
      name: manual.name,
      quantity: manual.quantity || '100g',
      calories,
      protein_g: parseFloat(manual.protein_g) || 0,
      carbs_g: parseFloat(manual.carbs_g) || 0,
      fat_g: parseFloat(manual.fat_g) || 0,
      fiber_g: parseFloat(manual.fiber_g) || 0,
    })
  }

  const setField = (field: keyof ManualForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setManual(prev => ({ ...prev, [field]: e.target.value }))

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

          <button
            onClick={() => setMode('manual')}
            className="mx-4 mt-3 mb-1 py-2.5 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm border border-[#2e2e2e] hover:border-[#22c55e]/50"
          >
            Entrada manual
          </button>

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

            {query.trim() && (
              <div className="mt-4">
                <div className="flex items-center gap-1.5 mb-2">
                  {offError ? <WifiOff size={12} className="text-[#525252]" /> : <Wifi size={12} className="text-[#525252]" />}
                  <p className="text-[10px] text-[#525252] uppercase tracking-wider font-semibold">Open Food Facts</p>
                </div>
                {offLoading ? (
                  <p className="text-center text-[#525252] text-sm py-4">A pesquisar...</p>
                ) : offError ? (
                  <p className="text-center text-[#525252] text-sm py-4">Sem ligação ao Open Food Facts</p>
                ) : offResults.length === 0 ? (
                  <p className="text-center text-[#525252] text-sm py-4">Sem resultados online</p>
                ) : (
                  <div className="space-y-1">
                    {offResults.map(p => (
                      <button
                        key={p.code}
                        onClick={() => handleSelectFood(offToFoodEntry(p))}
                        className="w-full flex items-center justify-between px-3 py-3 bg-[#1a1a1a] rounded-xl text-left hover:bg-[#222]"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{p.name}</p>
                          <p className="text-[10px] text-[#525252] mt-0.5">
                            {p.brand ? `${p.brand} · ` : ''}{Math.round(p.per100g.calories)} kcal/100g
                            {' · '}P {Math.round(p.per100g.protein_g)}g
                            {' · '}C {Math.round(p.per100g.carbs_g)}g
                            {' · '}G {Math.round(p.per100g.fat_g)}g
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-[#525252] flex-shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                )}
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
              type="text"
              inputMode="decimal"
              value={grams}
              onChange={e => setGrams(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="ex: 100"
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-[#22c55e]"
              autoFocus
            />
          </div>

          {/* Live calorie preview */}
          {portionCalc ? (
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
          ) : (
            <div className="bg-[#1a1a1a] rounded-2xl p-4 text-center">
              <p className="text-[#525252] text-sm">Introduz a quantidade para ver as calorias</p>
            </div>
          )}

          <p className="text-[10px] text-[#525252] text-center">
            Valores por 100g: {selected.per100g.calories} kcal · P {selected.per100g.protein_g}g · C {selected.per100g.carbs_g}g · G {selected.per100g.fat_g}g
          </p>

          <button
            onClick={handleAddFromDB}
            disabled={!gramsNum || gramsNum <= 0}
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

          <div>
            <label className="text-xs text-[#737373] block mb-1.5">Nome do alimento *</label>
            <input
              type="text"
              value={manual.name}
              onChange={setField('name')}
              placeholder="ex: Arroz basmati"
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          <div>
            <label className="text-xs text-[#737373] block mb-1.5">Quantidade</label>
            <input
              type="text"
              value={manual.quantity}
              onChange={setField('quantity')}
              placeholder="ex: 100g, 1 fatia"
              className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          {([
            { field: 'calories', label: 'Calorias (kcal) *' },
            { field: 'protein_g', label: 'Proteína (g)' },
            { field: 'carbs_g', label: 'Carboidratos (g)' },
            { field: 'fat_g', label: 'Gordura (g)' },
            { field: 'fiber_g', label: 'Fibra (g)' },
          ] as { field: keyof ManualForm; label: string }[]).map(({ field, label }) => (
            <div key={field}>
              <label className="text-xs text-[#737373] block mb-1.5">{label}</label>
              <input
                type="text"
                inputMode="decimal"
                value={manual[field]}
                onChange={setField(field)}
                placeholder="0"
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]"
              />
            </div>
          ))}

          <button
            onClick={handleAddManual}
            disabled={!manual.name.trim() || !parseFloat(manual.calories)}
            className="w-full py-3.5 bg-[#22c55e] rounded-xl text-white font-semibold disabled:opacity-40 mt-2"
          >
            Adicionar ao plano
          </button>
        </div>
      )}
    </div>
  )
}
