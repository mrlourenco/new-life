import { useState } from 'react'
import { Trash2, Search } from 'lucide-react'
import type { Exercise } from '../../types/workout'
import { inputCls } from './planBuilderConstants'
import ExercisePicker from './ExercisePicker'

interface Props {
  exercise: Exercise
  index: number
  canRemove: boolean
  onUpdate: (patch: Partial<Exercise>) => void
  onRemove: () => void
}

export default function ExerciseEditor({ exercise: ex, index: ei, canRemove, onUpdate, onRemove }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)

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

      {pickerOpen && (
        <ExercisePicker
          onSelect={entry => {
            onUpdate({ name: entry.name, muscle: entry.muscle, equipment: entry.equipment })
            setPickerOpen(false)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <div className="flex gap-2">
        <input
          value={ex.name}
          onChange={e => onUpdate({ name: e.target.value })}
          placeholder="Nome do exercício *"
          className={inputCls + ' flex-1'}
        />
        <button
          onClick={() => setPickerOpen(true)}
          title="Escolher do catálogo"
          className="px-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg text-[#737373] hover:text-[#f97316] hover:border-[#f97316]/50 flex-shrink-0"
        >
          <Search size={15} />
        </button>
      </div>

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

      <input
        value={ex.weight_suggestion ?? ''}
        onChange={e => onUpdate({ weight_suggestion: e.target.value || undefined })}
        placeholder="Carga sugerida (ex: 70% 1RM)"
        className={inputCls}
      />
    </div>
  )
}
