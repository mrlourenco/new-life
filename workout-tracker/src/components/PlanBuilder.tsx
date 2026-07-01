import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { WorkoutPlan, WorkoutSession, Exercise } from '../types/workout'
import Field from './workout/Field'
import SessionEditor from './workout/SessionEditor'
import { GOALS, inputCls } from './workout/planBuilderConstants'

interface Props {
  onSave: (plan: WorkoutPlan) => void
  onCancel: () => void
}

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
              <SessionEditor
                key={sess.id}
                session={sess}
                index={si}
                expanded={expandedSession === sess.id}
                canRemove={sessions.length > 1}
                onToggleExpand={() => setExpandedSession(expandedSession === sess.id ? '' : sess.id)}
                onRemove={() => removeSession(sess.id)}
                onUpdate={patch => updateSession(sess.id, patch)}
                onUpdateExercise={(exId, patch) => updateExercise(sess.id, exId, patch)}
                onRemoveExercise={exId => removeExercise(sess.id, exId)}
                onAddExercise={() => addExercise(sess.id)}
              />
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
