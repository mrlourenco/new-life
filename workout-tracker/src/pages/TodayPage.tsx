import { useState } from 'react'
import { Play, Zap, Pencil, Trash2, Clock, CheckCircle2 } from 'lucide-react'
import type { WorkoutPlan, WorkoutSession, ActiveWorkout, WorkoutLog, WorkoutWeekAssignment } from '../types/workout'
import { muscleLabel } from '../utils/labels'
import { formatDurationSeconds } from '../utils/format'
import { getDaySessionIds, findSession } from '../utils/workout'
import WorkoutLogEditor from '../components/workout/WorkoutLogEditor'
import SessionDetail from '../components/workout/SessionDetail'

interface Props {
  today: string
  plans: WorkoutPlan[]
  active: ActiveWorkout | null
  logs: WorkoutLog[]
  assignments: WorkoutWeekAssignment[]
  weekStartDay: 0 | 1
  onStart: (plan: WorkoutPlan, session: WorkoutSession) => void
  onResume: () => void
  onUpdateLog: (log: WorkoutLog) => void
  onDeleteLog: (id: string) => void
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

export default function TodayPage({ today, plans, active, logs, assignments, weekStartDay, onStart, onResume, onUpdateLog, onDeleteLog }: Props) {
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null)
  const [viewing, setViewing] = useState<{ plan: WorkoutPlan; session: WorkoutSession } | null>(null)

  const dateLabel = new Date(today + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

  const todayLogs = logs.filter(l => l.date === today)
  const scheduled = getDaySessionIds(today, assignments, plans, weekStartDay)
    .map(id => findSession(plans, id))
    .filter(Boolean) as { plan: WorkoutPlan; session: WorkoutSession }[]

  if (editingLog) {
    return (
      <WorkoutLogEditor
        log={editingLog}
        onSave={log => { onUpdateLog(log); setEditingLog(null) }}
        onDelete={id => { onDeleteLog(id); setEditingLog(null) }}
        onCancel={() => setEditingLog(null)}
      />
    )
  }

  if (viewing) {
    return (
      <SessionDetail
        plan={viewing.plan}
        session={viewing.session}
        onStart={(p, s) => { setViewing(null); onStart(p, s) }}
        onClose={() => setViewing(null)}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-14 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Hoje</h1>
        <p className="text-[#737373] text-sm mt-0.5 capitalize">{dateLabel}</p>
      </div>

      {/* In-progress workout */}
      {active && (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#f97316]/30 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#f97316] rounded-full animate-pulse" />
            <p className="text-[#f97316] text-xs font-semibold uppercase tracking-wider">Treino em curso</p>
          </div>
          <p className="text-white font-bold text-lg">{active.session.name}</p>
          <p className="text-[#737373] text-sm mt-0.5">
            {active.log.exercises.filter(e => e.sets.every(s => s.completed)).length}/{active.session.exercises.length} exercícios completos
          </p>
          <button onClick={onResume}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#f97316] rounded-xl text-white font-semibold hover:bg-[#ea6c0a] transition-colors">
            <Play size={18} fill="currentColor" />
            Continuar treino
          </button>
        </div>
      )}

      {/* Workouts logged today */}
      {todayLogs.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-3">Registado hoje</p>
          <div className="space-y-2">
            {todayLogs.map(log => {
              const completedSets = log.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
              const totalSets = log.exercises.reduce((n, e) => n + e.sets.length, 0)
              return (
                <div key={log.id} className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{log.session_name}</p>
                      <p className="text-[10px] text-[#525252] mt-0.5 flex items-center gap-2">
                        <span>{completedSets}/{totalSets} séries</span>
                        {log.duration_seconds != null && (
                          <span className="flex items-center gap-0.5"><Clock size={9} />{formatDurationSeconds(log.duration_seconds)}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button onClick={() => setEditingLog(log)} className="p-1.5 text-[#525252] hover:text-[#f97316]">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => { if (confirm('Apagar este treino?')) onDeleteLog(log.id) }}
                        className="p-1.5 text-[#525252] hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Scheduled for today */}
      {scheduled.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-3">Agendado para hoje</p>
          <div className="space-y-3">
            {scheduled.map(({ plan, session }) => (
              <SessionCard key={session.id} plan={plan} session={session} onStart={onStart} onView={setViewing} />
            ))}
          </div>
        </div>
      )}

      {/* All workouts / empty state */}
      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
            <Zap size={28} className="text-[#f97316]" />
          </div>
          <p className="text-white font-semibold text-lg">Sem planos de treino</p>
          <p className="text-[#737373] text-sm mt-1 max-w-xs">Importa ou cria um plano no separador Planos para começar</p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-3">Todos os treinos</p>
          <div className="space-y-2">
            {plans.flatMap(plan =>
              plan.sessions.map(session => (
                <SessionCard key={session.id} plan={plan} session={session} onStart={onStart} onView={setViewing} compact />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SessionCard({ plan, session, onStart, onView, compact = false }: {
  plan: WorkoutPlan
  session: WorkoutSession
  onStart: (p: WorkoutPlan, s: WorkoutSession) => void
  onView: (v: { plan: WorkoutPlan; session: WorkoutSession }) => void
  compact?: boolean
}) {
  return (
    <div className={`bg-[#1a1a1a] rounded-2xl p-4 ${compact ? '' : 'border border-[#2e2e2e]'}`}>
      <div className="flex items-start justify-between gap-3">
        <button onClick={() => onView({ plan, session })} className="flex-1 min-w-0 text-left">
          <p className="text-white font-semibold truncate">{session.name}</p>
          <p className="text-[#737373] text-xs mt-0.5">{plan.name}</p>
          {!compact && (
            <>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {session.muscle_groups.map(m => (
                  <span key={m} className={`text-[10px] px-2 py-0.5 rounded-full ${muscleClass(m)}`}>{muscleLabel(m)}</span>
                ))}
              </div>
              <p className="text-[#525252] text-xs mt-2">{session.exercises.length} exercícios · toca para ver</p>
            </>
          )}
        </button>
        <button onClick={() => onStart(plan, session)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#f97316] rounded-xl text-white text-xs font-semibold hover:bg-[#ea6c0a] transition-colors">
          <Play size={14} fill="currentColor" />
          {compact ? '' : 'Iniciar'}
        </button>
      </div>
    </div>
  )
}
