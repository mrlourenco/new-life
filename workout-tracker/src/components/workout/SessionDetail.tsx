import { useState } from 'react'
import { X, Play, Clock, Trash2 } from 'lucide-react'
import type { WorkoutPlan, WorkoutSession, Exercise } from '../../types/workout'
import { muscleLabel, equipmentLabel } from '../../utils/labels'

interface Props {
  plan: WorkoutPlan
  session: WorkoutSession
  onStart?: (plan: WorkoutPlan, session: WorkoutSession) => void
  onUpdatePlan?: (plan: WorkoutPlan) => void
  onClose: () => void
}

const MUSCLE_COLORS: Record<string, string> = {
  chest: 'bg-red-900/40 text-red-400',
  back: 'bg-blue-900/40 text-blue-400',
  legs: 'bg-green-900/40 text-green-400',
  shoulders: 'bg-yellow-900/40 text-yellow-400',
  arms: 'bg-purple-900/40 text-purple-400',
  triceps: 'bg-purple-900/40 text-purple-400',
  biceps: 'bg-indigo-900/40 text-indigo-400',
  core: 'bg-orange-900/40 text-orange-400',
  glutes: 'bg-pink-900/40 text-pink-400',
  cardio: 'bg-cyan-900/40 text-cyan-400',
}

function muscleClass(m: string) {
  return MUSCLE_COLORS[m.toLowerCase()] ?? 'bg-[#2e2e2e] text-[#a3a3a3]'
}

export default function SessionDetail({ plan, session, onStart, onUpdatePlan, onClose }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>(() => session.exercises.map(e => ({ ...e })))

  const updateExercises = (next: Exercise[]) => {
    setExercises(next)
    if (onUpdatePlan) {
      onUpdatePlan({
        ...plan,
        sessions: plan.sessions.map(s => s.id !== session.id ? s : { ...s, exercises: next }),
      })
    }
  }

  const setTarget = (exId: string, value: number | undefined) => {
    updateExercises(exercises.map(e => e.id === exId ? { ...e, target_weight: value } : e))
  }

  const deleteExercise = (exId: string) => {
    updateExercises(exercises.filter(e => e.id !== exId))
  }

  const effectiveSession = { ...session, exercises }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold truncate">{session.name}</h2>
          <p className="text-xs text-[#737373] truncate">{plan.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        {session.muscle_groups.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {session.muscle_groups.map(m => (
              <span key={m} className={`text-[10px] px-2 py-0.5 rounded-full ${muscleClass(m)}`}>{muscleLabel(m)}</span>
            ))}
          </div>
        )}

        <p className="text-xs text-[#525252]">{exercises.length} exercícios</p>

        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div key={ex.id} className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="text-xs text-[#525252] font-semibold mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{ex.name}</p>
                  <p className="text-[10px] text-[#525252] mt-0.5">{muscleLabel(ex.muscle)} · {equipmentLabel(ex.equipment)}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                    <span className="text-[11px] text-[#a3a3a3]">{ex.sets} × {ex.reps}</span>
                    <span className="text-[11px] text-[#737373] flex items-center gap-0.5"><Clock size={9} />{ex.rest_seconds}s</span>
                    {ex.weight_suggestion && <span className="text-[11px] text-[#f97316]">{ex.weight_suggestion}</span>}
                  </div>
                  {ex.notes && <p className="text-[10px] text-[#737373] italic mt-1">{ex.notes}</p>}
                  {onUpdatePlan && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold">Peso-alvo</span>
                      <div className="flex items-center gap-1 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg px-2 py-1 focus-within:border-[#f97316]">
                        <input
                          type="number" inputMode="decimal" min={0} step="0.5"
                          value={ex.target_weight ?? ''}
                          onChange={e => setTarget(ex.id, e.target.value === '' ? undefined : (parseFloat(e.target.value) || 0))}
                          placeholder="—"
                          className="w-12 bg-transparent text-sm text-white text-center outline-none"
                        />
                        <span className="text-[10px] text-[#525252]">kg</span>
                      </div>
                    </div>
                  )}
                </div>
                {onUpdatePlan && (
                  <button onClick={() => deleteExercise(ex.id)}
                    className="p-1.5 text-[#525252] hover:text-red-400 flex-shrink-0 -mt-0.5">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {onStart && (
        <div className="px-4 pb-8 pt-2 border-t border-[#1a1a1a]">
          <button
            onClick={() => onStart(plan, effectiveSession)}
            disabled={exercises.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#f97316] rounded-xl text-white font-semibold hover:bg-[#ea6c0a] transition-colors disabled:opacity-40">
            <Play size={18} fill="currentColor" />
            Iniciar treino
          </button>
        </div>
      )}
    </div>
  )
}
