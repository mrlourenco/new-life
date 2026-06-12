import { Trash2 } from 'lucide-react'
import type { Exercise } from '../../types/workout'
import { MUSCLES, EQUIPMENT, CARDIO_EQUIPMENT, CARDIO_EQUIPMENT_LABELS, isCardio, inputCls } from './planBuilderConstants'

interface Props {
  exercise: Exercise
  index: number
  canRemove: boolean
  onUpdate: (patch: Partial<Exercise>) => void
  onRemove: () => void
}

export default function ExerciseEditor({ exercise: ex, index: ei, canRemove, onUpdate, onRemove }: Props) {
  return (
    <div className="bg-[#0f0f0f] rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#f97316] font-semibold">#{ei + 1}</span>
        {canRemove && (
          <button onClick={onRemove} className="p-1 text-[#525252] hover:text-red-400">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <input
        value={ex.name}
        onChange={e => onUpdate({ name: e.target.value })}
        placeholder="Nome do exercício *"
        className={inputCls}
      />

      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] text-[#737373] mb-1">Séries</p>
          <input type="number" min={1} value={ex.sets} onChange={e => onUpdate({ sets: parseInt(e.target.value) || 1 })} className={inputCls + ' text-center'} />
        </div>
        <div>
          <p className="text-[10px] text-[#737373] mb-1">Reps</p>
          <input value={ex.reps} onChange={e => onUpdate({ reps: e.target.value })} placeholder="10-12" className={inputCls + ' text-center'} />
        </div>
        <div>
          <p className="text-[10px] text-[#737373] mb-1">Descanso (s)</p>
          <input type="number" min={0} value={ex.rest_seconds} onChange={e => onUpdate({ rest_seconds: parseInt(e.target.value) || 60 })} className={inputCls + ' text-center'} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-[#737373] mb-1">Tipo</p>
          <select
            value={ex.muscle}
            onChange={e => {
              const muscle = e.target.value
              const defaultEq = isCardio(muscle) ? 'none' : 'barbell'
              onUpdate({ muscle, equipment: defaultEq })
            }}
            className={inputCls}
          >
            {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <p className="text-[10px] text-[#737373] mb-1">Equipamento</p>
          {isCardio(ex.muscle) ? (
            <select value={ex.equipment} onChange={e => onUpdate({ equipment: e.target.value })} className={inputCls}>
              {CARDIO_EQUIPMENT.map(eq => <option key={eq} value={eq}>{CARDIO_EQUIPMENT_LABELS[eq]}</option>)}
            </select>
          ) : (
            <select value={ex.equipment} onChange={e => onUpdate({ equipment: e.target.value })} className={inputCls}>
              {EQUIPMENT.map(eq => <option key={eq} value={eq}>{eq}</option>)}
            </select>
          )}
        </div>
      </div>

      <input
        value={ex.notes ?? ''}
        onChange={e => onUpdate({ notes: e.target.value || undefined })}
        placeholder="Notas técnicas (opcional)"
        className={inputCls}
      />
      <input
        value={ex.weight_suggestion ?? ''}
        onChange={e => onUpdate({ weight_suggestion: e.target.value || undefined })}
        placeholder="Carga sugerida (ex: 70% 1RM)"
        className={inputCls}
      />
    </div>
  )
}
