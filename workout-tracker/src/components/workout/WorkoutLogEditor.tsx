import { useState } from 'react'
import { X, Check, Trash2 } from 'lucide-react'
import type { WorkoutLog, SetLog } from '../../types/workout'
import { muscleLabel } from '../../utils/labels'

interface Props {
  log: WorkoutLog
  onSave: (log: WorkoutLog) => void
  onDelete: (id: string) => void
  onCancel: () => void
}

// Edit the recorded sets (weight / reps / done) of a completed workout.
export default function WorkoutLogEditor({ log, onSave, onDelete, onCancel }: Props) {
  const [draft, setDraft] = useState<WorkoutLog>(() => JSON.parse(JSON.stringify(log)))

  const updateSet = (exIdx: number, setIdx: number, field: keyof SetLog, value: number | boolean) => {
    setDraft(prev => {
      const next: WorkoutLog = JSON.parse(JSON.stringify(prev))
      ;(next.exercises[exIdx].sets[setIdx] as unknown as Record<string, unknown>)[field] = value
      return next
    })
  }

  const handleDelete = () => {
    if (confirm('Apagar este treino? Esta ação não pode ser anulada.')) onDelete(log.id)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onCancel} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="text-white font-semibold flex-1 truncate">{draft.session_name}</h2>
        <button onClick={() => onSave(draft)}
          className="px-4 py-1.5 bg-[#f97316] rounded-lg text-white text-sm font-semibold">
          Guardar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-5">
        {draft.exercises.map((ex, exIdx) => (
          <div key={exIdx} className="space-y-2">
            <div>
              <p className="text-sm font-bold text-white">{ex.exercise_name}</p>
              {ex.muscle && <p className="text-[10px] text-[#525252]">{muscleLabel(ex.muscle)}</p>}
            </div>

            <div className="grid grid-cols-[28px_1fr_1fr_36px] gap-2 items-center px-1">
              <span className="text-[10px] text-[#525252] font-semibold">#</span>
              <span className="text-[10px] text-[#525252] font-semibold">Peso (kg)</span>
              <span className="text-[10px] text-[#525252] font-semibold">Reps</span>
              <span className="text-[10px] text-[#525252] font-semibold text-center">Feita</span>
            </div>

            {ex.sets.map((s, setIdx) => (
              <div key={setIdx} className="grid grid-cols-[28px_1fr_1fr_36px] gap-2 items-center">
                <span className="text-xs text-[#737373]">{s.set_number}</span>
                <input type="number" inputMode="decimal" value={s.weight_kg ?? ''}
                  onChange={e => updateSet(exIdx, setIdx, 'weight_kg', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#f97316]" />
                <input type="number" inputMode="numeric" value={s.reps_done ?? ''}
                  onChange={e => updateSet(exIdx, setIdx, 'reps_done', parseInt(e.target.value) || 0)}
                  placeholder={s.reps_target}
                  className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#f97316]" />
                <button onClick={() => updateSet(exIdx, setIdx, 'completed', !s.completed)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border ${s.completed ? 'bg-[#f97316] border-[#f97316]' : 'border-[#2e2e2e] bg-[#1a1a1a]'}`}>
                  {s.completed && <Check size={14} className="text-white" />}
                </button>
              </div>
            ))}
          </div>
        ))}

        <button onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 bg-[#1a1a1a] hover:border-red-500/60">
          <Trash2 size={15} />Apagar treino
        </button>
      </div>
    </div>
  )
}
