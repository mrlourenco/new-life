import { useState } from 'react'
import { Trash2, Scale, Target } from 'lucide-react'
import type { MacroTargets, WeightEntry } from '../../types/profile'

interface Props {
  macroTargets: MacroTargets
  weightEntries: WeightEntry[]
  onSaveMacroTargets: (t: MacroTargets) => void
  onAddWeightEntry: (e: WeightEntry) => void
  onDeleteWeightEntry: (id: string) => void
}

function MacroInput({ label, value, color, onChange }: { label: string; value: number; color: string; onChange: (v: number) => void }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
        <span className="text-xs text-[#737373]">alvo diário</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range" min={0} max={label === 'Proteína' || label === 'Carboidratos' ? 500 : label === 'Gordura' ? 200 : 100}
          value={value} onChange={e => onChange(Number(e.target.value))}
          className="flex-1 accent-[#22c55e] h-1.5"
        />
        <div className="flex items-center gap-1 bg-[#0f0f0f] rounded-lg px-2 py-1 w-20">
          <input type="number" value={value} onChange={e => onChange(Math.max(0, Number(e.target.value)))}
            className="w-full bg-transparent text-white text-sm text-right outline-none" />
          <span className="text-[10px] text-[#525252] flex-shrink-0">g</span>
        </div>
      </div>
    </div>
  )
}

export default function NutritionProfilePage({ macroTargets, weightEntries, onSaveMacroTargets, onAddWeightEntry, onDeleteWeightEntry }: Props) {
  const [targets, setTargets] = useState<MacroTargets>({ ...macroTargets })
  const [dirty, setDirty] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [weightNote, setWeightNote] = useState('')
  const today = new Date().toISOString().slice(0, 10)

  const update = (key: keyof MacroTargets, val: number) => {
    setTargets(prev => ({ ...prev, [key]: val }))
    setDirty(true)
  }

  const save = () => {
    onSaveMacroTargets(targets)
    setDirty(false)
  }

  const logWeight = () => {
    const kg = parseFloat(weightInput)
    if (!kg || kg <= 0) return
    onAddWeightEntry({ id: crypto.randomUUID(), date: today, weight_kg: kg, note: weightNote || undefined })
    setWeightInput('')
    setWeightNote('')
  }

  const recentEntries = [...weightEntries].reverse().slice(0, 30)
  const latestWeight = recentEntries[0]?.weight_kg
  const earliestInView = recentEntries[recentEntries.length - 1]?.weight_kg
  const weightDelta = latestWeight && earliestInView ? +(latestWeight - earliestInView).toFixed(1) : null

  // Simple weight chart: last 14 entries
  const chartEntries = [...weightEntries].slice(-14)
  const minW = chartEntries.length ? Math.min(...chartEntries.map(e => e.weight_kg)) - 1 : 0
  const maxW = chartEntries.length ? Math.max(...chartEntries.map(e => e.weight_kg)) + 1 : 100

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-6">
      <h2 className="text-lg font-bold text-white">Perfil</h2>

      {/* Macro targets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-[#22c55e]" />
            <p className="text-sm font-semibold text-white">Objetivos de macros</p>
          </div>
          {dirty && (
            <button onClick={save} className="px-3 py-1.5 bg-[#22c55e] rounded-lg text-xs font-semibold text-black">
              Guardar
            </button>
          )}
        </div>

        <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 text-xs text-[#737373] space-y-0.5">
          <p>As cores dos macros mudam consoante o consumo:</p>
          <div className="flex gap-4 mt-1.5">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" /> Dentro do alvo</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> +10% acima</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> +20% acima</span>
          </div>
        </div>

        <MacroInput label="Proteína" value={targets.protein_g} color="text-[#60a5fa]" onChange={v => update('protein_g', v)} />
        <MacroInput label="Carboidratos" value={targets.carbs_g} color="text-[#f97316]" onChange={v => update('carbs_g', v)} />
        <MacroInput label="Gordura" value={targets.fat_g} color="text-[#a78bfa]" onChange={v => update('fat_g', v)} />
        <MacroInput label="Fibra" value={targets.fiber_g} color="text-[#14b8a6]" onChange={v => update('fiber_g', v)} />

        {dirty && (
          <button onClick={save} className="w-full py-3 bg-[#22c55e] rounded-xl text-white font-semibold text-sm">
            Guardar objetivos
          </button>
        )}
      </div>

      {/* Weight tracking */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-[#22c55e]" />
          <p className="text-sm font-semibold text-white">Peso corporal</p>
        </div>

        {latestWeight && (
          <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{latestWeight} <span className="text-sm font-normal text-[#737373]">kg</span></p>
              <p className="text-xs text-[#525252] mt-0.5">Último registo</p>
            </div>
            {weightDelta !== null && recentEntries.length > 1 && (
              <div className={`text-sm font-semibold ${weightDelta < 0 ? 'text-[#22c55e]' : weightDelta > 0 ? 'text-[#f97316]' : 'text-[#737373]'}`}>
                {weightDelta > 0 ? '+' : ''}{weightDelta} kg
                <p className="text-[10px] text-[#525252] font-normal text-right">vs anterior</p>
              </div>
            )}
          </div>
        )}

        {/* Mini chart */}
        {chartEntries.length >= 2 && (
          <div className="bg-[#1a1a1a] rounded-xl p-3">
            <p className="text-[10px] text-[#525252] mb-2 uppercase tracking-wider font-semibold">Últimas {chartEntries.length} pesagens</p>
            <div className="flex items-end gap-1 h-16">
              {chartEntries.map((e, i) => {
                const pct = maxW === minW ? 50 : ((e.weight_kg - minW) / (maxW - minW)) * 100
                const isLast = i === chartEntries.length - 1
                return (
                  <div key={e.id} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full rounded-sm" style={{ height: `${Math.max(4, pct)}%`, background: isLast ? '#22c55e' : '#2e2e2e' }} />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-[#525252]">{chartEntries[0]?.date.slice(5)}</span>
              <span className="text-[9px] text-[#525252]">{chartEntries[chartEntries.length - 1]?.date.slice(5)}</span>
            </div>
          </div>
        )}

        {/* Log weight form */}
        <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 space-y-3">
          <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">Registar peso</p>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 flex-1 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 focus-within:border-[#22c55e]">
              <input type="number" value={weightInput} onChange={e => setWeightInput(e.target.value)}
                placeholder="70.5" step="0.1" min="0"
                className="flex-1 bg-transparent text-white text-sm outline-none w-0" />
              <span className="text-xs text-[#525252] flex-shrink-0">kg</span>
            </div>
            <button onClick={logWeight} disabled={!weightInput || parseFloat(weightInput) <= 0}
              className="px-4 py-2.5 bg-[#22c55e] rounded-xl text-black text-sm font-semibold disabled:opacity-40">
              +
            </button>
          </div>
          <input value={weightNote} onChange={e => setWeightNote(e.target.value)} placeholder="Nota (opcional)"
            className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#22c55e]" />
        </div>

        {/* Weight history */}
        {recentEntries.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-[#525252] uppercase tracking-wider font-semibold">Histórico</p>
            {recentEntries.map(e => (
              <div key={e.id} className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{e.weight_kg} kg</span>
                    {e.note && <span className="text-[10px] text-[#525252] truncate">{e.note}</span>}
                  </div>
                  <p className="text-[10px] text-[#525252] mt-0.5">{new Date(e.date + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                </div>
                <button onClick={() => onDeleteWeightEntry(e.id)} className="p-1.5 text-[#525252] hover:text-red-400 flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
