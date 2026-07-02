import { useState } from 'react'
import { X, Sparkles, Loader } from 'lucide-react'
import type { WorkoutPlan } from '../types/workout'
import { generateWorkoutPlan, type PlanPrefs } from '../lib/geminiPlan'

interface Props {
  onGenerated: (plan: WorkoutPlan) => void
  onClose: () => void
}

const GOALS: { value: WorkoutPlan['goal']; label: string }[] = [
  { value: 'hypertrophy', label: 'Hipertrofia' },
  { value: 'strength', label: 'Força' },
  { value: 'endurance', label: 'Resistência' },
  { value: 'general', label: 'Geral' },
]

const EQUIPMENT_OPTIONS = [
  { value: 'barbell', label: 'Barra' },
  { value: 'dumbbells', label: 'Halteres' },
  { value: 'cable', label: 'Cabos' },
  { value: 'machine', label: 'Máquinas' },
  { value: 'bodyweight', label: 'Peso corporal' },
  { value: 'bands', label: 'Elásticos' },
  { value: 'kettlebell', label: 'Kettlebell' },
]

const LEVELS: { value: PlanPrefs['level']; label: string }[] = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermédio' },
  { value: 'advanced', label: 'Avançado' },
]

export default function AIPlanGenerator({ onGenerated, onClose }: Props) {
  const [goal, setGoal] = useState<WorkoutPlan['goal']>('hypertrophy')
  const [days, setDays] = useState(4)
  const [equipment, setEquipment] = useState<string[]>(['barbell', 'dumbbells', 'cable', 'machine', 'bodyweight'])
  const [level, setLevel] = useState<PlanPrefs['level']>('intermediate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleEquipment = (eq: string) =>
    setEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq])

  const handleGenerate = async () => {
    if (equipment.length === 0) { setError('Seleciona pelo menos um equipamento'); return }
    setLoading(true)
    setError(null)
    try {
      const plan = await generateWorkoutPlan({ goal, days, equipment, level })
      onGenerated(plan)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar plano')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-1 text-[#a3a3a3]">
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Sparkles size={16} className="text-[#f97316]" />
          <h2 className="text-white font-semibold">Gerar plano com IA</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Objetivo */}
        <div>
          <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider mb-2">Objetivo</p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${goal === g.value ? 'bg-[#f97316] text-white' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dias por semana */}
        <div>
          <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider mb-2">Dias por semana</p>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${days === d ? 'bg-[#f97316] text-white' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Nível */}
        <div>
          <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider mb-2">Nível</p>
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${level === l.value ? 'bg-[#f97316] text-white' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Equipamento */}
        <div>
          <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider mb-2">Equipamento disponível</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map(eq => (
              <button
                key={eq.value}
                onClick={() => toggleEquipment(eq.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${equipment.includes(eq.value) ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40' : 'bg-[#1a1a1a] text-[#737373] border border-[#2e2e2e]'}`}
              >
                {eq.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="px-3 py-2.5 bg-red-900/30 border border-red-800/50 rounded-xl">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-8 pt-3 border-t border-[#1a1a1a]">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3.5 bg-[#f97316] rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              A gerar plano...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Gerar plano
            </>
          )}
        </button>
        <p className="text-center text-[10px] text-[#525252] mt-2">Powered by Google Gemini · pode demorar 5-10s</p>
      </div>
    </div>
  )
}
