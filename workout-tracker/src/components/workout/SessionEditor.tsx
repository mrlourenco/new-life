import { Plus, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react'
import type { WorkoutSession, Exercise } from '../../types/workout'
import Field from './Field'
import ExerciseEditor from './ExerciseEditor'
import { MUSCLES, DAYS, inputCls } from './planBuilderConstants'

interface Props {
  session: WorkoutSession
  index: number
  expanded: boolean
  canRemove: boolean
  onToggleExpand: () => void
  onRemove: () => void
  onUpdate: (patch: Partial<WorkoutSession>) => void
  onToggleMuscle: (muscle: string) => void
  onUpdateExercise: (exId: string, patch: Partial<Exercise>) => void
  onRemoveExercise: (exId: string) => void
  onAddExercise: () => void
}

export default function SessionEditor({
  session: sess,
  index: si,
  expanded,
  canRemove,
  onToggleExpand,
  onRemove,
  onUpdate,
  onToggleMuscle,
  onUpdateExercise,
  onRemoveExercise,
  onAddExercise,
}: Props) {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          className="flex-1 text-left"
          onClick={onToggleExpand}
        >
          <p className="text-white font-medium text-sm">
            {sess.name || `Sessão ${si + 1}`}
          </p>
          <p className="text-[#525252] text-xs">{sess.exercises.length} exercícios</p>
        </button>
        {canRemove && (
          <button onClick={onRemove} className="p-1.5 text-[#525252] hover:text-red-400">
            <Trash2 size={15} />
          </button>
        )}
        <button onClick={onToggleExpand} className="p-1.5 text-[#525252]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[#2e2e2e] px-4 py-4 space-y-4">
          <Field label="Nome da sessão *">
            <input value={sess.name} onChange={e => onUpdate({ name: e.target.value })} placeholder="ex: Push A" className={inputCls} />
          </Field>

          <Field label="Dia da semana">
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => onUpdate({ day_of_week: sess.day_of_week === i ? undefined : i })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${sess.day_of_week === i ? 'bg-[#f97316] text-white' : 'bg-[#0f0f0f] text-[#737373] border border-[#2e2e2e]'}`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Grupos musculares">
            <div className="flex flex-wrap gap-1.5">
              {MUSCLES.map(m => {
                const active = sess.muscle_groups.includes(m)
                return (
                  <button
                    key={m}
                    onClick={() => onToggleMuscle(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${active ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40' : 'bg-[#0f0f0f] text-[#737373] border border-[#2e2e2e]'}`}
                  >
                    {active && <Check size={10} className="inline mr-1" />}{m}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Exercises */}
          <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">Exercícios</p>
          {sess.exercises.map((ex, ei) => (
            <ExerciseEditor
              key={ex.id}
              exercise={ex}
              index={ei}
              canRemove={sess.exercises.length > 1}
              onUpdate={patch => onUpdateExercise(ex.id, patch)}
              onRemove={() => onRemoveExercise(ex.id)}
            />
          ))}

          <button
            onClick={onAddExercise}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[#2e2e2e] rounded-xl text-[#737373] text-xs hover:border-[#f97316]/50 hover:text-[#f97316] transition-colors"
          >
            <Plus size={14} />
            Adicionar exercício
          </button>
        </div>
      )}
    </div>
  )
}
