import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Check, X, Trophy, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import type { ActiveWorkout, SetLog } from '../types/workout'
import { useRestTimer } from '../hooks/useRestTimer'
import RestTimerOverlay from './RestTimerOverlay'

interface Props {
  active: ActiveWorkout
  onUpdate: (w: ActiveWorkout) => void
  onFinish: (w: ActiveWorkout) => void
  onDiscard: () => void
}

function formatDuration(startedAt: string) {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ActiveWorkoutView({ active, onUpdate, onFinish, onDiscard }: Props) {
  const timer = useRestTimer()
  const [elapsed, setElapsed] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setElapsed(formatDuration(active.log.started_at))
    const interval = setInterval(() => setElapsed(formatDuration(active.log.started_at)), 1000)
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
    timer.start(restSecs)
  }, [active, onUpdate, timer])

  const uncompleteSet = useCallback((setIdx: number) => {
    const updated: ActiveWorkout = JSON.parse(JSON.stringify(active))
    const s = updated.log.exercises[active.current_exercise_index].sets[setIdx]
    s.completed = false
    s.completed_at = undefined
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

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">
      {timer.running && (
        <RestTimerOverlay
          seconds={timer.seconds}
          total={timer.total}
          progress={timer.progress}
          onSkip={timer.skip}
          onStop={timer.stop}
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
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {active.session.exercises.map((e, i) => {
          const done = active.log.exercises[i].sets.every(s => s.completed)
          const isCurrent = i === active.current_exercise_index
          return (
            <button
              key={e.id}
              onClick={() => goToExercise(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent
                  ? 'bg-[#f97316] text-white'
                  : done
                  ? 'bg-[#1a3320] text-[#4ade80]'
                  : 'bg-[#1a1a1a] text-[#a3a3a3]'
              }`}
            >
              {done && !isCurrent ? <Check size={10} className="inline mr-1" /> : null}
              {e.name.split(' ').slice(0, 2).join(' ')}
            </button>
          )
        })}
      </div>

      {/* Main exercise */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="mt-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{ex.name}</h2>
              <p className="text-sm text-[#737373] mt-0.5 capitalize">{ex.muscle} · {ex.equipment}</p>
            </div>
            <div className="flex items-center gap-1">
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
              <p className="text-sm font-bold text-white">{ex.rest_seconds}s</p>
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
        <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_1fr_48px] gap-2 px-4 py-2 border-b border-[#2e2e2e]">
            <span className="text-xs text-[#737373] font-semibold">#</span>
            <span className="text-xs text-[#737373] font-semibold">Peso (kg)</span>
            <span className="text-xs text-[#737373] font-semibold">Reps</span>
            <span />
          </div>

          {exLog.sets.map((s, i) => (
            <div
              key={i}
              className={`grid grid-cols-[40px_1fr_1fr_48px] gap-2 items-center px-4 py-3 border-b border-[#2e2e2e] last:border-0 transition-colors ${s.completed ? 'bg-[#0f2318]' : ''}`}
            >
              <span className={`text-sm font-bold ${s.completed ? 'text-[#4ade80]' : 'text-[#737373]'}`}>
                {s.completed ? <Check size={16} /> : i + 1}
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={s.weight_kg ?? ''}
                onChange={e => updateSet(i, 'weight_kg', parseFloat(e.target.value) || 0)}
                disabled={s.completed}
                placeholder="—"
                className="w-full bg-[#0f0f0f] rounded-lg px-2 py-2 text-sm text-white text-center disabled:opacity-40 border border-[#2e2e2e] focus:border-[#f97316] focus:outline-none"
              />
              <input
                type="number"
                min="0"
                value={s.reps_done ?? ''}
                onChange={e => updateSet(i, 'reps_done', parseInt(e.target.value) || 0)}
                disabled={s.completed}
                placeholder={s.reps_target}
                className="w-full bg-[#0f0f0f] rounded-lg px-2 py-2 text-sm text-white text-center disabled:opacity-40 border border-[#2e2e2e] focus:border-[#f97316] focus:outline-none"
              />
              <button
                onClick={() => s.completed ? uncompleteSet(i) : completeSet(i, ex.rest_seconds)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  s.completed
                    ? 'bg-[#166534] text-[#4ade80]'
                    : 'bg-[#f97316] text-white hover:bg-[#ea6c0a]'
                }`}
              >
                <Check size={18} />
              </button>
            </div>
          ))}
        </div>

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
