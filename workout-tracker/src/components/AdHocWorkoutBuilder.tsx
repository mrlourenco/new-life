import { useState } from 'react'
import { X, Plus, Trash2, Dumbbell, Play, Save } from 'lucide-react'
import type { WorkoutPlan, WorkoutSession } from '../types/workout'
import { muscleLabel } from '../utils/labels'

const MUSCLES = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core', 'glutes', 'cardio']

export const ADHOC_PLAN: WorkoutPlan = {
  id: 'adhoc',
  name: 'Avulso',
  goal: 'general',
  days_per_week: 0,
  sessions: [],
}

interface AdHocExercise {
  id: string
  name: string
  muscle: string
  sets: number
  reps: string
  weight?: number
  rest_seconds: number
}

interface Props {
  onStart?: (plan: WorkoutPlan, session: WorkoutSession) => void
  onSave?: (plan: WorkoutPlan, session: WorkoutSession) => void
  onClose: () => void
}

export default function AdHocWorkoutBuilder({ onStart, onSave, onClose }: Props) {
  const [sessionName, setSessionName] = useState('')
  const [exercises, setExercises] = useState<AdHocExercise[]>([])

  const [exName, setExName] = useState('')
  const [exMuscle, setExMuscle] = useState('')
  const [exSets, setExSets] = useState(3)
  const [exReps, setExReps] = useState('10')
  const [exWeight, setExWeight] = useState('')
  const [exRest, setExRest] = useState(60)

  const addExercise = () => {
    if (!exName.trim()) return
    setExercises(prev => [...prev, {
      id: crypto.randomUUID(),
      name: exName.trim(),
      muscle: exMuscle || 'other',
      sets: exSets,
      reps: exReps || '10',
      weight: exWeight ? parseFloat(exWeight) : undefined,
      rest_seconds: exRest,
    }])
    setExName('')
    setExWeight('')
  }

  const removeExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  const buildSession = (): WorkoutSession => ({
    id: crypto.randomUUID(),
    name: sessionName.trim() || 'Treino livre',
    muscle_groups: [...new Set(exercises.map(e => e.muscle).filter(m => m !== 'other'))],
    exercises: exercises.map(e => ({
      id: e.id,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      rest_seconds: e.rest_seconds,
      muscle: e.muscle,
      equipment: 'other',
      target_weight: e.weight,
    })),
  })

  const canSubmit = exercises.length > 0

  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="flex-1 text-white font-semibold">Treino livre</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-5">
        <input
          value={sessionName}
          onChange={e => setSessionName(e.target.value)}
          placeholder="Nome do treino (opcional)"
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#f97316]"
        />

        {exercises.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-[#525252] uppercase tracking-wider font-semibold">
              Exercícios ({exercises.length})
            </p>
            {exercises.map((e, i) => (
              <div key={e.id} className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-3">
                <span className="text-xs text-[#525252] font-mono w-5 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{e.name}</p>
                  <p className="text-[10px] text-[#525252] mt-0.5">
                    {e.sets}×{e.reps}{e.weight != null ? ` · ${e.weight}kg` : ''} · {e.rest_seconds}s
                    {e.muscle !== 'other' && ` · ${muscleLabel(e.muscle)}`}
                  </p>
                </div>
                <button onClick={() => removeExercise(e.id)}
                  className="p-1.5 text-[#525252] hover:text-red-400 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {exercises.length === 0 && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-3">
              <Dumbbell size={20} className="text-[#f97316]" />
            </div>
            <p className="text-[#737373] text-sm">Adiciona exercícios para começar</p>
          </div>
        )}

        <div className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
          <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">Adicionar exercício</p>

          <input
            value={exName}
            onChange={e => setExName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addExercise()}
            placeholder="Nome do exercício"
            className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#f97316]"
          />

          <select
            value={exMuscle}
            onChange={e => setExMuscle(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#f97316]"
          >
            <option value="">Grupo muscular (opcional)</option>
            {MUSCLES.map(m => (
              <option key={m} value={m}>{muscleLabel(m)}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-[10px] text-[#525252] uppercase tracking-wider text-center">Séries</p>
              <input type="number" min={1} max={20} value={exSets}
                onChange={e => setExSets(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-2 py-2.5 text-white text-sm text-center outline-none focus:border-[#f97316]"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#525252] uppercase tracking-wider text-center">Reps</p>
              <input value={exReps} onChange={e => setExReps(e.target.value)} placeholder="10"
                className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-2 py-2.5 text-white text-sm text-center outline-none focus:border-[#f97316]"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#525252] uppercase tracking-wider text-center">Peso (kg)</p>
              <input type="number" min={0} step={0.5} value={exWeight}
                onChange={e => setExWeight(e.target.value)}
                placeholder="—"
                className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-2 py-2.5 text-white text-sm text-center outline-none focus:border-[#f97316]"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#525252] uppercase tracking-wider text-center">Descanso (s)</p>
              <input type="number" min={0} step={15} value={exRest}
                onChange={e => setExRest(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-2 py-2.5 text-white text-sm text-center outline-none focus:border-[#f97316]"
              />
            </div>
          </div>

          <button onClick={addExercise} disabled={!exName.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#f97316]/10 border border-[#f97316]/30 rounded-xl text-[#f97316] text-sm font-semibold disabled:opacity-40 hover:border-[#f97316]/60">
            <Plus size={16} />Adicionar exercício
          </button>
        </div>
      </div>

      <div className="flex gap-3 px-4 pt-3 pb-8 border-t border-[#1a1a1a]">
        {onSave && (
          <button onClick={() => canSubmit && onSave(ADHOC_PLAN, buildSession())} disabled={!canSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white text-sm font-semibold disabled:opacity-40 hover:border-[#f97316]/40">
            <Save size={15} />Guardar
          </button>
        )}
        {onStart && (
          <button onClick={() => canSubmit && onStart(ADHOC_PLAN, buildSession())} disabled={!canSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#f97316] rounded-xl text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#ea6c0a]">
            <Play size={15} fill="currentColor" />Iniciar
          </button>
        )}
      </div>
    </div>
  )
}
