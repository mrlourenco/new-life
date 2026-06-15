import { useState } from 'react'
import { X, Play, Clock, Trash2, Pencil, Plus, Check } from 'lucide-react'
import type { WorkoutPlan, WorkoutSession, Exercise } from '../../types/workout'
import { muscleLabel, equipmentLabel } from '../../utils/labels'

const MUSCLES = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core', 'glutes', 'cardio']

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

interface FormState {
  name: string; muscle: string; sets: number; reps: string; weight: string; rest: number
}

function blankForm(): FormState {
  return { name: '', muscle: '', sets: 3, reps: '10', weight: '', rest: 60 }
}

function exerciseToForm(ex: Exercise): FormState {
  return {
    name: ex.name,
    muscle: ex.muscle === 'other' ? '' : ex.muscle,
    sets: ex.sets,
    reps: ex.reps,
    weight: ex.target_weight != null ? String(ex.target_weight) : '',
    rest: ex.rest_seconds,
  }
}

function ExerciseForm({ form, onChange, onSubmit, onCancel, submitLabel }: {
  form: FormState
  onChange: (f: FormState) => void
  onSubmit: () => void
  onCancel: () => void
  submitLabel: string
}) {
  const set = (partial: Partial<FormState>) => onChange({ ...form, ...partial })
  return (
    <div className="bg-[#0f0f0f] rounded-2xl p-3 space-y-2.5 border border-[#2e2e2e]">
      <input
        value={form.name}
        onChange={e => set({ name: e.target.value })}
        placeholder="Nome do exercício"
        className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#f97316]"
      />
      <select
        value={form.muscle}
        onChange={e => { const m = e.target.value; set(m === 'cardio' ? { muscle: m, sets: 0 } : { muscle: m }) }}
        className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#f97316]"
      >
        <option value="">Grupo muscular (opcional)</option>
        {MUSCLES.map(m => <option key={m} value={m}>{muscleLabel(m)}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-[10px] text-[#525252] uppercase tracking-wider text-center">Séries</p>
          <input type="number" min={0} max={20} value={form.sets}
            onChange={e => set({ sets: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-2 py-2 text-white text-sm text-center outline-none focus:border-[#f97316]" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-[#525252] uppercase tracking-wider text-center">{form.muscle === 'cardio' ? 'Dur./Dist.' : 'Reps'}</p>
          <input value={form.reps} onChange={e => set({ reps: e.target.value })} placeholder={form.muscle === 'cardio' ? '30 min' : '10'}
            className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-2 py-2 text-white text-sm text-center outline-none focus:border-[#f97316]" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-[#525252] uppercase tracking-wider text-center">Peso (kg)</p>
          <input type="number" min={0} step={0.5} value={form.weight}
            onChange={e => set({ weight: e.target.value })} placeholder="—"
            className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-2 py-2 text-white text-sm text-center outline-none focus:border-[#f97316]" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-[#525252] uppercase tracking-wider text-center">Descanso (s)</p>
          <input type="number" min={0} step={15} value={form.rest}
            onChange={e => set({ rest: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-2 py-2 text-white text-sm text-center outline-none focus:border-[#f97316]" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-2 rounded-xl border border-[#2e2e2e] text-[#737373] text-sm hover:border-[#3f3f3f]">
          Cancelar
        </button>
        <button onClick={onSubmit} disabled={!form.name.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#f97316] rounded-xl text-white text-sm font-semibold disabled:opacity-40">
          <Check size={14} />{submitLabel}
        </button>
      </div>
    </div>
  )
}

function formToExercise(f: FormState, existing?: Exercise): Exercise {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    name: f.name.trim(),
    muscle: f.muscle || 'other',
    equipment: existing?.equipment ?? 'other',
    sets: f.sets,
    reps: f.reps || '10',
    rest_seconds: f.rest,
    target_weight: f.weight ? parseFloat(f.weight) : undefined,
    notes: existing?.notes,
    weight_suggestion: existing?.weight_suggestion,
  }
}

export default function SessionDetail({ plan, session, onStart, onUpdatePlan, onClose }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>(() => session.exercises.map(e => ({ ...e })))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(blankForm())
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(blankForm())

  const editable = !!onUpdatePlan

  const persist = (next: Exercise[]) => {
    setExercises(next)
    if (onUpdatePlan) {
      const muscle_groups = [...new Set(next.map(e => e.muscle).filter(m => m !== 'other'))]
      onUpdatePlan({
        ...plan,
        sessions: plan.sessions.map(s => s.id !== session.id ? s : { ...s, exercises: next, muscle_groups }),
      })
    }
  }

  const startEdit = (ex: Exercise) => {
    setShowAdd(false)
    setEditingId(ex.id)
    setEditForm(exerciseToForm(ex))
  }

  const saveEdit = () => {
    if (!editForm.name.trim() || !editingId) return
    persist(exercises.map(e => e.id === editingId ? formToExercise(editForm, e) : e))
    setEditingId(null)
  }

  const deleteExercise = (exId: string) => {
    persist(exercises.filter(e => e.id !== exId))
    if (editingId === exId) setEditingId(null)
  }

  const addExercise = () => {
    if (!addForm.name.trim()) return
    persist([...exercises, formToExercise(addForm)])
    setAddForm(blankForm())
    setShowAdd(false)
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

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-3">
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
            <div key={ex.id}>
              {editingId === ex.id ? (
                <ExerciseForm
                  form={editForm}
                  onChange={setEditForm}
                  onSubmit={saveEdit}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Guardar"
                />
              ) : (
                <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-[#525252] font-semibold mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{ex.name}</p>
                      <p className="text-[10px] text-[#525252] mt-0.5">{muscleLabel(ex.muscle)} · {equipmentLabel(ex.equipment)}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                        <span className="text-[11px] text-[#a3a3a3]">{ex.sets > 0 ? `${ex.sets} × ${ex.reps}` : ex.reps}</span>
                        <span className="text-[11px] text-[#737373] flex items-center gap-0.5"><Clock size={9} />{ex.rest_seconds}s</span>
                        {ex.target_weight != null && <span className="text-[11px] text-[#f97316]">{ex.target_weight}kg</span>}
                        {ex.weight_suggestion && !ex.target_weight && <span className="text-[11px] text-[#f97316]">{ex.weight_suggestion}</span>}
                      </div>
                      {ex.notes && <p className="text-[10px] text-[#737373] italic mt-1">{ex.notes}</p>}
                    </div>
                    {editable && (
                      <div className="flex gap-0.5 flex-shrink-0 -mt-0.5">
                        <button onClick={() => startEdit(ex)} className="p-1.5 text-[#525252] hover:text-[#f97316]">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => deleteExercise(ex.id)} className="p-1.5 text-[#525252] hover:text-red-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {editable && (
          showAdd ? (
            <ExerciseForm
              form={addForm}
              onChange={setAddForm}
              onSubmit={addExercise}
              onCancel={() => { setShowAdd(false); setAddForm(blankForm()) }}
              submitLabel="Adicionar"
            />
          ) : (
            <button
              onClick={() => { setEditingId(null); setShowAdd(true) }}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#2e2e2e] rounded-2xl text-[#737373] text-sm hover:border-[#f97316]/40 hover:text-[#f97316] transition-colors">
              <Plus size={15} />Adicionar exercício
            </button>
          )
        )}
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
