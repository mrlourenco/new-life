import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, X, Check } from 'lucide-react'
import type { WorkoutPlan, WorkoutSession, Exercise } from '../types/workout'

interface Props {
  onSave: (plan: WorkoutPlan) => void
  onCancel: () => void
}

const GOALS = [
  { value: 'hypertrophy', label: 'Hipertrofia' },
  { value: 'strength', label: 'Força' },
  { value: 'endurance', label: 'Resistência' },
  { value: 'general', label: 'Geral' },
]

const MUSCLES = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core', 'glutes', 'cardio']
const EQUIPMENT = ['barbell', 'dumbbells', 'cable', 'machine', 'bodyweight', 'bands', 'kettlebell']
const CARDIO_EQUIPMENT = ['none', 'treadmill', 'bike', 'rower', 'elliptical', 'outdoor', 'other']
const CARDIO_EQUIPMENT_LABELS: Record<string, string> = {
  none: 'Sem equipamento',
  treadmill: 'Passadeira',
  bike: 'Bicicleta',
  rower: 'Remo',
  elliptical: 'Elíptica',
  outdoor: 'Ao ar livre',
  other: 'Outro',
}

function isCardio(muscle: string) { return muscle === 'cardio' }
const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function emptyExercise(): Exercise {
  return { id: uid(), name: '', sets: 3, reps: '10-12', rest_seconds: 60, muscle: 'chest', equipment: 'barbell' }
}

function emptySession(): WorkoutSession {
  return { id: uid(), name: '', muscle_groups: [], exercises: [emptyExercise()] }
}

type Step = 'plan' | 'sessions'

export default function PlanBuilder({ onSave, onCancel }: Props) {
  const [step, setStep] = useState<Step>('plan')
  const [name, setName] = useState('')
  const [goal, setGoal] = useState<WorkoutPlan['goal']>('hypertrophy')
  const [description, setDescription] = useState('')
  const [sessions, setSessions] = useState<WorkoutSession[]>([emptySession()])
  const [expandedSession, setExpandedSession] = useState<string>(sessions[0].id)
  const [errors, setErrors] = useState<string[]>([])

  /* ── Session helpers ─────────────────────────── */
  const updateSession = (id: string, patch: Partial<WorkoutSession>) =>
    setSessions(s => s.map(sess => sess.id === id ? { ...sess, ...patch } : sess))

  const addSession = () => {
    const s = emptySession()
    setSessions(prev => [...prev, s])
    setExpandedSession(s.id)
  }

  const removeSession = (id: string) =>
    setSessions(s => s.filter(sess => sess.id !== id))

  /* ── Exercise helpers ────────────────────────── */
  const updateExercise = (sessId: string, exId: string, patch: Partial<Exercise>) =>
    setSessions(s => s.map(sess =>
      sess.id === sessId
        ? { ...sess, exercises: sess.exercises.map(ex => ex.id === exId ? { ...ex, ...patch } : ex) }
        : sess
    ))

  const addExercise = (sessId: string) =>
    setSessions(s => s.map(sess =>
      sess.id === sessId ? { ...sess, exercises: [...sess.exercises, emptyExercise()] } : sess
    ))

  const removeExercise = (sessId: string, exId: string) =>
    setSessions(s => s.map(sess =>
      sess.id === sessId ? { ...sess, exercises: sess.exercises.filter(e => e.id !== exId) } : sess
    ))

  /* ── Muscle group toggle ─────────────────────── */
  const toggleMuscle = (sessId: string, muscle: string) =>
    setSessions(s => s.map(sess => {
      if (sess.id !== sessId) return sess
      const has = sess.muscle_groups.includes(muscle)
      return { ...sess, muscle_groups: has ? sess.muscle_groups.filter(m => m !== muscle) : [...sess.muscle_groups, muscle] }
    }))

  /* ── Validation & save ───────────────────────── */
  const validate = () => {
    const errs: string[] = []
    if (!name.trim()) errs.push('Nome do plano obrigatório')
    sessions.forEach((s, i) => {
      if (!s.name.trim()) errs.push(`Sessão ${i + 1}: nome obrigatório`)
      s.exercises.forEach((e, j) => {
        if (!e.name.trim()) errs.push(`Sessão ${i + 1}, exercício ${j + 1}: nome obrigatório`)
      })
    })
    return errs
  }

  const handleSave = () => {
    const errs = validate()
    if (errs.length) { setErrors(errs); return }
    const plan: WorkoutPlan = {
      id: uid(),
      name: name.trim(),
      goal,
      description: description.trim() || undefined,
      days_per_week: sessions.length,
      sessions,
    }
    onSave(plan)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onCancel} className="p-2 -ml-2 text-[#737373]"><X size={20} /></button>
        <h1 className="font-semibold text-white">Criar plano</h1>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 rounded-lg bg-[#f97316] text-white text-xs font-semibold"
        >
          Guardar
        </button>
      </div>

      {/* Step tabs */}
      <div className="flex border-b border-[#1a1a1a]">
        {(['plan', 'sessions'] as Step[]).map((s, i) => (
          <button
            key={s}
            onClick={() => { setErrors([]); setStep(s) }}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${step === s ? 'text-[#f97316] border-b-2 border-[#f97316]' : 'text-[#525252]'}`}
          >
            {i + 1}. {s === 'plan' ? 'Plano' : 'Sessões & exercícios'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {errors.length > 0 && (
          <div className="px-3 py-2.5 bg-red-900/30 border border-red-800/50 rounded-xl">
            {errors.map((e, i) => <p key={i} className="text-xs text-red-400">{e}</p>)}
          </div>
        )}

        {/* ── Step 1: Plan info ── */}
        {step === 'plan' && (
          <>
            <Field label="Nome do plano *">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ex: Push/Pull/Legs"
                className={inputCls}
              />
            </Field>

            <Field label="Objetivo">
              <div className="flex flex-wrap gap-2">
                {GOALS.map(g => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value as WorkoutPlan['goal'])}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${goal === g.value ? 'bg-[#f97316] text-white' : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Descrição (opcional)">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Notas sobre o plano..."
                className={inputCls + ' resize-none'}
              />
            </Field>

            <button
              onClick={() => { setErrors([]); setStep('sessions') }}
              className="w-full py-3 bg-[#f97316] rounded-xl text-white font-semibold mt-2"
            >
              Seguinte: Sessões →
            </button>
          </>
        )}

        {/* ── Step 2: Sessions ── */}
        {step === 'sessions' && (
          <>
            {sessions.map((sess, si) => (
              <div key={sess.id} className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    className="flex-1 text-left"
                    onClick={() => setExpandedSession(expandedSession === sess.id ? '' : sess.id)}
                  >
                    <p className="text-white font-medium text-sm">
                      {sess.name || `Sessão ${si + 1}`}
                    </p>
                    <p className="text-[#525252] text-xs">{sess.exercises.length} exercícios</p>
                  </button>
                  {sessions.length > 1 && (
                    <button onClick={() => removeSession(sess.id)} className="p-1.5 text-[#525252] hover:text-red-400">
                      <Trash2 size={15} />
                    </button>
                  )}
                  <button onClick={() => setExpandedSession(expandedSession === sess.id ? '' : sess.id)} className="p-1.5 text-[#525252]">
                    {expandedSession === sess.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {expandedSession === sess.id && (
                  <div className="border-t border-[#2e2e2e] px-4 py-4 space-y-4">
                    <Field label="Nome da sessão *">
                      <input value={sess.name} onChange={e => updateSession(sess.id, { name: e.target.value })} placeholder="ex: Push A" className={inputCls} />
                    </Field>

                    <Field label="Dia da semana">
                      <div className="flex flex-wrap gap-1.5">
                        {DAYS.map((d, i) => (
                          <button
                            key={i}
                            onClick={() => updateSession(sess.id, { day_of_week: sess.day_of_week === i ? undefined : i })}
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
                              onClick={() => toggleMuscle(sess.id, m)}
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
                      <div key={ex.id} className="bg-[#0f0f0f] rounded-xl p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#f97316] font-semibold">#{ei + 1}</span>
                          {sess.exercises.length > 1 && (
                            <button onClick={() => removeExercise(sess.id, ex.id)} className="p-1 text-[#525252] hover:text-red-400">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        <input
                          value={ex.name}
                          onChange={e => updateExercise(sess.id, ex.id, { name: e.target.value })}
                          placeholder="Nome do exercício *"
                          className={inputCls}
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-[10px] text-[#737373] mb-1">Séries</p>
                            <input type="number" min={1} value={ex.sets} onChange={e => updateExercise(sess.id, ex.id, { sets: parseInt(e.target.value) || 1 })} className={inputCls + ' text-center'} />
                          </div>
                          <div>
                            <p className="text-[10px] text-[#737373] mb-1">Reps</p>
                            <input value={ex.reps} onChange={e => updateExercise(sess.id, ex.id, { reps: e.target.value })} placeholder="10-12" className={inputCls + ' text-center'} />
                          </div>
                          <div>
                            <p className="text-[10px] text-[#737373] mb-1">Descanso (s)</p>
                            <input type="number" min={0} value={ex.rest_seconds} onChange={e => updateExercise(sess.id, ex.id, { rest_seconds: parseInt(e.target.value) || 60 })} className={inputCls + ' text-center'} />
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
                                updateExercise(sess.id, ex.id, { muscle, equipment: defaultEq })
                              }}
                              className={inputCls}
                            >
                              {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#737373] mb-1">Equipamento</p>
                            {isCardio(ex.muscle) ? (
                              <select value={ex.equipment} onChange={e => updateExercise(sess.id, ex.id, { equipment: e.target.value })} className={inputCls}>
                                {CARDIO_EQUIPMENT.map(eq => <option key={eq} value={eq}>{CARDIO_EQUIPMENT_LABELS[eq]}</option>)}
                              </select>
                            ) : (
                              <select value={ex.equipment} onChange={e => updateExercise(sess.id, ex.id, { equipment: e.target.value })} className={inputCls}>
                                {EQUIPMENT.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                              </select>
                            )}
                          </div>
                        </div>

                        <input
                          value={ex.notes ?? ''}
                          onChange={e => updateExercise(sess.id, ex.id, { notes: e.target.value || undefined })}
                          placeholder="Notas técnicas (opcional)"
                          className={inputCls}
                        />
                        <input
                          value={ex.weight_suggestion ?? ''}
                          onChange={e => updateExercise(sess.id, ex.id, { weight_suggestion: e.target.value || undefined })}
                          placeholder="Carga sugerida (ex: 70% 1RM)"
                          className={inputCls}
                        />
                      </div>
                    ))}

                    <button
                      onClick={() => addExercise(sess.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[#2e2e2e] rounded-xl text-[#737373] text-xs hover:border-[#f97316]/50 hover:text-[#f97316] transition-colors"
                    >
                      <Plus size={14} />
                      Adicionar exercício
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addSession}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#2e2e2e] rounded-xl text-[#737373] text-sm hover:border-[#f97316]/50 hover:text-[#f97316] transition-colors"
            >
              <Plus size={16} />
              Adicionar sessão
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const inputCls = 'w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-[#f97316] focus:outline-none placeholder:text-[#525252]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-[#737373] font-semibold">{label}</label>
      {children}
    </div>
  )
}
