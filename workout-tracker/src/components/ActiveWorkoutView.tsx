import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Check, X, Trophy, Clock, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import type { ActiveWorkout, SetLog, Exercise } from '../types/workout'
import { useRestTimer } from '../hooks/useRestTimer'
import RestTimerOverlay from './RestTimerOverlay'
import { muscleLabel, equipmentLabel } from '../utils/labels'
import { formatElapsedSince } from '../utils/format'
import type { ExerciseHistory } from '../hooks/useStore'
import { EXERCISES, gifUrl } from '../data/exercises'
import ExerciseNav from './workout/ExerciseNav'
import ExerciseHistoryCard from './workout/ExerciseHistoryCard'
import ExerciseEditor from './workout/ExerciseEditor'
import SetRow from './workout/SetRow'

interface Props {
  active: ActiveWorkout
  onUpdate: (w: ActiveWorkout) => void
  onFinish: (w: ActiveWorkout) => void
  onDiscard: () => void
  exerciseHistory: Map<string, ExerciseHistory>
}

function newExerciseDraft(): Exercise {
  return { id: crypto.randomUUID(), name: '', sets: 3, reps: '10-12', rest_seconds: 90, muscle: 'chest', equipment: 'barbell' }
}

export default function ActiveWorkoutView({ active, onUpdate, onFinish, onDiscard, exerciseHistory }: Props) {
  const timer = useRestTimer()
  const [elapsed, setElapsed] = useState(() => formatElapsedSince(active.log.started_at))
  const [expanded, setExpanded] = useState<string | null>(null)
  const [lastCompleted, setLastCompleted] = useState<{ exIdx: number; setIdx: number } | null>(null)
  const [adding, setAdding] = useState<Exercise | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setElapsed(formatElapsedSince(active.log.started_at)), 1000)
    return () => clearInterval(interval)
  }, [active.log.started_at])

  const exLog = active.log.exercises[active.current_exercise_index]
  const ex = active.session.exercises[active.current_exercise_index]
  const totalEx = active.session.exercises.length

  const updateSet = useCallback((setIdx: number, field: keyof SetLog, value: number | boolean | string) => {
    const updated: ActiveWorkout = JSON.parse(JSON.stringify(active))
    const s = updated.log.exercises[active.current_exercise_index].sets[setIdx]
    ;(s as unknown as Record<string, unknown>)[field] = value
    onUpdate(updated)
  }, [active, onUpdate])

  const completeSet = useCallback((setIdx: number, restSecs: number) => {
    const updated: ActiveWorkout = JSON.parse(JSON.stringify(active))
    const s = updated.log.exercises[active.current_exercise_index].sets[setIdx]
    s.completed = true
    s.completed_at = new Date().toISOString()
    onUpdate(updated)
    setLastCompleted({ exIdx: active.current_exercise_index, setIdx })
    timer.start(restSecs)
  }, [active, onUpdate, timer])

  const uncompleteSet = useCallback((setIdx: number) => {
    const updated: ActiveWorkout = JSON.parse(JSON.stringify(active))
    const s = updated.log.exercises[active.current_exercise_index].sets[setIdx]
    s.completed = false
    s.completed_at = undefined
    onUpdate(updated)
  }, [active, onUpdate])

  // Skip rest: end the timer, set stays completed
  const handleSkipRest = useCallback(() => {
    timer.skip()
    setLastCompleted(null)
  }, [timer])

  // Cancel: undo the set that was just completed and end the timer
  const handleCancelSet = useCallback(() => {
    if (lastCompleted) {
      const updated: ActiveWorkout = JSON.parse(JSON.stringify(active))
      const s = updated.log.exercises[lastCompleted.exIdx].sets[lastCompleted.setIdx]
      s.completed = false
      s.completed_at = undefined
      onUpdate(updated)
    }
    timer.stop()
    setLastCompleted(null)
  }, [active, onUpdate, timer, lastCompleted])

  const updateExercise = useCallback((patch: Partial<Exercise>) => {
    const updated: ActiveWorkout = JSON.parse(JSON.stringify(active))
    const i = active.current_exercise_index
    updated.session.exercises[i] = { ...updated.session.exercises[i], ...patch }
    onUpdate(updated)
  }, [active, onUpdate])

  const addExercise = useCallback((exercise: Exercise) => {
    const updated: ActiveWorkout = JSON.parse(JSON.stringify(active))
    updated.session.exercises.push(exercise)
    updated.log.exercises.push({
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      muscle: exercise.muscle,
      notes: exercise.notes,
      sets: Array.from({ length: exercise.sets }, (_, i) => ({ set_number: i + 1, reps_target: exercise.reps, completed: false })),
    })
    updated.current_exercise_index = updated.session.exercises.length - 1
    onUpdate(updated)
  }, [active, onUpdate])

  const removeExercise = useCallback((idx: number) => {
    const updated: ActiveWorkout = JSON.parse(JSON.stringify(active))
    updated.session.exercises.splice(idx, 1)
    updated.log.exercises.splice(idx, 1)
    if (updated.current_exercise_index >= updated.session.exercises.length) {
      updated.current_exercise_index = Math.max(0, updated.session.exercises.length - 1)
    }
    onUpdate(updated)
  }, [active, onUpdate])

  const goToExercise = useCallback((idx: number) => {
    const updated: ActiveWorkout = { ...active, current_exercise_index: idx }
    onUpdate(updated)
    setExpanded(null)
  }, [active, onUpdate])

  const allDone = active.log.exercises.every(e => e.sets.every(s => s.completed))
  const completedExercises = active.log.exercises.filter(e => e.sets.every(s => s.completed)).length

  const handleFinish = () => {
    const now = new Date().toISOString()
    const duration = Math.floor((new Date(now).getTime() - new Date(active.log.started_at).getTime()) / 1000)
    const updated: ActiveWorkout = {
      ...active,
      log: { ...active.log, finished_at: now, duration_seconds: duration }
    }
    onFinish(updated)
  }

  // Add-exercise form
  if (adding) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
          <button onClick={() => setAdding(null)} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
          <h2 className="text-white font-semibold flex-1">Adicionar exercício</h2>
          <button onClick={() => { if (adding.name.trim()) { addExercise(adding); setAdding(null) } }}
            disabled={!adding.name.trim()}
            className="px-4 py-1.5 bg-[#f97316] rounded-lg text-white text-sm font-semibold disabled:opacity-40">
            Adicionar
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
          <ExerciseEditor
            exercise={adding}
            index={0}
            canRemove={false}
            onUpdate={patch => setAdding(prev => prev ? { ...prev, ...patch } : prev)}
            onRemove={() => {}}
          />
        </div>
      </div>
    )
  }

  // No exercises left (e.g. all removed)
  if (!ex || !exLog) {
    return (
      <div className="flex flex-col h-full bg-[#0f0f0f]">
        <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
          <button onClick={onDiscard} className="p-2 -ml-2 text-[#737373]"><X size={20} /></button>
          <p className="font-semibold text-sm text-white">{active.session.name}</p>
          <span className="w-8" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <p className="text-[#737373] text-sm">Sem exercícios neste treino.</p>
          <button onClick={() => setAdding(newExerciseDraft())}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#f97316] rounded-xl text-white text-sm font-semibold">
            <Plus size={16} />Adicionar exercício
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">
      {timer.running && (
        <RestTimerOverlay
          seconds={timer.seconds}
          total={timer.total}
          progress={timer.progress}
          onSkip={handleSkipRest}
          onCancel={handleCancelSet}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onDiscard} className="p-2 -ml-2 text-[#737373] hover:text-[#f97316]">
          <X size={20} />
        </button>
        <div className="text-center">
          <p className="font-semibold text-sm text-white truncate max-w-[160px]">{active.session.name}</p>
          <p className="text-xs text-[#737373] flex items-center gap-1 justify-center mt-0.5">
            <Clock size={10} />{elapsed}
          </p>
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1.5 rounded-lg bg-[#f97316] text-white text-xs font-semibold hover:bg-[#ea6c0a] transition-colors"
        >
          Terminar
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2">
        <div className="flex justify-between text-xs text-[#737373] mb-1">
          <span>{completedExercises}/{totalEx} exercícios</span>
          {allDone && <span className="text-[#f97316] font-semibold flex items-center gap-1"><Trophy size={10} /> Completo!</span>}
        </div>
        <div className="h-1 bg-[#2e2e2e] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#f97316] rounded-full transition-all duration-500"
            style={{ width: `${(completedExercises / totalEx) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercise list (collapsed overview) */}
      <ExerciseNav
        exercises={active.session.exercises}
        exerciseLogs={active.log.exercises}
        currentIndex={active.current_exercise_index}
        onSelect={goToExercise}
      />

      {/* Main exercise */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="mt-3 mb-4">
          {(() => {
            const gif = EXERCISES.find(e => e.name === ex.name)?.gif
            return gif ? (
              <img
                src={gifUrl(gif)}
                alt=""
                onError={e => { e.currentTarget.style.display = 'none' }}
                className="w-full h-48 object-cover rounded-xl mb-3 bg-[#1a1a1a]"
              />
            ) : null
          })()}
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{ex.name}</h2>
              <p className="text-sm text-[#737373] mt-0.5">{muscleLabel(ex.muscle)} · {equipmentLabel(ex.equipment)}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {totalEx > 1 && (
                <button
                  onClick={() => { if (confirm(`Remover "${ex.name}" deste treino?`)) removeExercise(active.current_exercise_index) }}
                  className="p-2 rounded-lg bg-[#1a1a1a] text-[#525252] hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => goToExercise(active.current_exercise_index - 1)}
                disabled={active.current_exercise_index === 0}
                className="p-2 rounded-lg bg-[#1a1a1a] text-[#737373] disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => goToExercise(active.current_exercise_index + 1)}
                disabled={active.current_exercise_index === totalEx - 1}
                className="p-2 rounded-lg bg-[#1a1a1a] text-[#737373] disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {ex.notes && (
            <div className="mt-2 px-3 py-2 bg-[#1a1a1a] rounded-lg">
              <p className="text-xs text-[#a3a3a3]">{ex.notes}</p>
            </div>
          )}

          <div className="flex gap-3 mt-3">
            <div className="px-3 py-1.5 bg-[#1a1a1a] rounded-lg text-center">
              <p className="text-xs text-[#737373]">Séries</p>
              <p className="text-sm font-bold text-white">{ex.sets}</p>
            </div>
            <div className="px-3 py-1.5 bg-[#1a1a1a] rounded-lg text-center">
              <p className="text-xs text-[#737373]">Reps</p>
              <p className="text-sm font-bold text-white">{ex.reps}</p>
            </div>
            <div className="px-3 py-1.5 bg-[#1a1a1a] rounded-lg text-center">
              <p className="text-xs text-[#737373]">Descanso</p>
              <div className="flex items-center justify-center">
                <input
                  type="number" min={0} value={ex.rest_seconds}
                  onChange={e => updateExercise({ rest_seconds: parseInt(e.target.value) || 0 })}
                  className="w-9 bg-transparent text-sm font-bold text-white text-center outline-none focus:text-[#f97316]"
                />
                <span className="text-sm font-bold text-white">s</span>
              </div>
            </div>
            {ex.weight_suggestion && (
              <div className="px-3 py-1.5 bg-[#1a1a1a] rounded-lg text-center">
                <p className="text-xs text-[#737373]">Carga</p>
                <p className="text-sm font-bold text-[#f97316]">{ex.weight_suggestion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sets table */}
        <ExerciseHistoryCard history={exerciseHistory.get(ex.name.toLowerCase().trim())} />

        <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_1fr_48px] gap-2 px-4 py-2 border-b border-[#2e2e2e]">
            <span className="text-xs text-[#737373] font-semibold">#</span>
            <span className="text-xs text-[#737373] font-semibold">Peso (kg)</span>
            <span className="text-xs text-[#737373] font-semibold">Reps</span>
            <span />
          </div>

          {exLog.sets.map((s, i) => (
            <SetRow
              key={i}
              set={s}
              index={i}
              restSeconds={ex.rest_seconds}
              onUpdateSet={updateSet}
              onCompleteSet={completeSet}
              onUncompleteSet={uncompleteSet}
            />
          ))}
        </div>

        {/* Add exercise */}
        <button
          onClick={() => setAdding(newExerciseDraft())}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 mt-3 border border-dashed border-[#2e2e2e] rounded-xl text-[#737373] text-xs hover:border-[#f97316]/50 hover:text-[#f97316] transition-colors"
        >
          <Plus size={14} />
          Adicionar exercício
        </button>

        {/* Other exercises overview */}
        <div className="mt-4">
          <button
            onClick={() => setExpanded(expanded ? null : 'others')}
            className="flex items-center gap-2 text-[#737373] text-xs mb-2"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Outros exercícios
          </button>
          {expanded && (
            <div className="space-y-2">
              {active.session.exercises.map((e, i) => {
                if (i === active.current_exercise_index) return null
                const done = active.log.exercises[i].sets.every(s => s.completed)
                return (
                  <button
                    key={e.id}
                    onClick={() => goToExercise(i)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-[#1a1a1a] rounded-xl text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{e.name}</p>
                      <p className="text-xs text-[#737373]">{e.sets}×{e.reps}</p>
                    </div>
                    {done
                      ? <Check size={16} className="text-[#4ade80]" />
                      : <ChevronRight size={16} className="text-[#737373]" />
                    }
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
