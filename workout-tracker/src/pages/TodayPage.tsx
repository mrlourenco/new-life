import { useState } from 'react'
import { Play, Zap, Pencil, Trash2, Clock, CheckCircle2, X, Dumbbell, Plus, Check } from 'lucide-react'
import type { WorkoutPlan, WorkoutSession, ActiveWorkout, WorkoutLog, WorkoutWeekAssignment } from '../types/workout'
import { activityTypeLabel, muscleLabel } from '../utils/labels'
import { formatDurationSeconds } from '../utils/format'
import { getDaySessionIds, findSession } from '../utils/workout'
import { getWeekDates } from '../utils/dates'
import WorkoutLogEditor from '../components/workout/WorkoutLogEditor'
import SessionDetail from '../components/workout/SessionDetail'
import AdHocWorkoutBuilder from '../components/AdHocWorkoutBuilder'
import ActivityBuilder from '../components/ActivityBuilder'

const ADHOC_ID = 'adhoc'

interface Props {
  today: string
  plans: WorkoutPlan[]
  active: ActiveWorkout | null
  logs: WorkoutLog[]
  assignments: WorkoutWeekAssignment[]
  weekStartDay: 0 | 1
  onStart: (plan: WorkoutPlan, session: WorkoutSession) => void
  onCompleteQuick: (plan: WorkoutPlan, session: WorkoutSession) => void
  onResume: () => void
  onUpdateLog: (log: WorkoutLog) => void
  onDeleteLog: (id: string) => void
  onUpdatePlan: (plan: WorkoutPlan) => void
  onSaveDayOverride: (weekStart: string, date: string, sessionIds: string[]) => void
}

function AddWorkoutSheet({ plans, onAdHoc, onActivity, onPlan, onClose }: {
  plans: WorkoutPlan[]
  onAdHoc: () => void
  onActivity: () => void
  onPlan: (plan: WorkoutPlan, session: WorkoutSession) => void
  onClose: () => void
}) {
  const allSessions = plans.filter(p => p.id !== ADHOC_ID).flatMap(p => p.sessions.map(s => ({ plan: p, session: s })))

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end" onClick={onClose}>
      <div className="bg-[#0f0f0f] rounded-t-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#1a1a1a] flex-shrink-0">
          <h3 className="text-white font-semibold">Planear treino para hoje</h3>
          <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto px-4 pt-4 pb-8 space-y-4">
          <button onClick={onAdHoc}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#f97316]/10 border border-[#f97316]/40 rounded-2xl hover:border-[#f97316]/70 transition-colors">
            <Dumbbell size={18} className="text-[#f97316] flex-shrink-0" />
            <div className="text-left">
              <p className="text-white text-sm font-semibold">Musculação livre</p>
              <p className="text-[#737373] text-xs mt-0.5">Exercícios, séries, reps, peso e descanso</p>
            </div>
          </button>

          <button onClick={onActivity}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl hover:border-[#f97316]/40 transition-colors">
            <Zap size={18} className="text-[#f97316] flex-shrink-0" />
            <div className="text-left">
              <p className="text-white text-sm font-semibold">Atividade / Aula</p>
              <p className="text-[#737373] text-xs mt-0.5">Body Pump, corrida, caminhada, cycling, yoga...</p>
            </div>
          </button>

          {allSessions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-[#525252] uppercase tracking-wider font-semibold">Ou adiciona uma sessão</p>
              {allSessions.map(({ plan, session }) => (
                <button key={session.id} onClick={() => onPlan(plan, session)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl hover:border-[#f97316]/40 transition-colors text-left">
                  <Plus size={14} className="text-[#f97316] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{session.name}</p>
                    <p className="text-[10px] text-[#525252] mt-0.5">
                      {plan.name} · {session.kind === 'activity' ? activityTypeLabel(session.activity_type ?? 'other') : `${session.exercises.length} ex.`}
                      {session.kind !== 'activity' && session.muscle_groups.length > 0 && ` · ${session.muscle_groups.slice(0, 2).map(muscleLabel).join(', ')}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TodayPage({
  today, plans, active, logs, assignments, weekStartDay,
  onStart, onCompleteQuick, onResume, onUpdateLog, onDeleteLog, onUpdatePlan, onSaveDayOverride,
}: Props) {
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null)
  const [viewing, setViewing] = useState<{ plan: WorkoutPlan; session: WorkoutSession } | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [showActivityBuilder, setShowActivityBuilder] = useState(false)
  const [showAdder, setShowAdder] = useState(false)

  const dateLabel = new Date(today + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

  const todayLogs = logs.filter(l => l.date === today)
  const doneSessionIds = new Set(todayLogs.map(l => l.session_id))
  const sessionIds = getDaySessionIds(today, assignments, plans, weekStartDay)
  const hasAdHoc = sessionIds.includes(ADHOC_ID)

  const scheduled = sessionIds
    .map((id, origIdx) => ({ id, origIdx }))
    .filter(({ id }) => id !== ADHOC_ID)
    .map(({ id, origIdx }) => {
      const found = findSession(plans, id)
      return found ? { ...found, origIdx } : null
    })
    .filter(Boolean) as ({ plan: WorkoutPlan; session: WorkoutSession; origIdx: number })[]

  const getWeekStart = () => getWeekDates(today, weekStartDay)[0]

  const handleBuilderSave = (_plan: WorkoutPlan, session: WorkoutSession) => {
    const existingAdhoc = plans.find(p => p.id === ADHOC_ID)
    onUpdatePlan({
      id: ADHOC_ID,
      name: 'Avulso',
      goal: 'general',
      days_per_week: 0,
      sessions: [...(existingAdhoc?.sessions ?? []), session],
    })
    const existingIds = sessionIds.filter(id => id !== ADHOC_ID)
    onSaveDayOverride(getWeekStart(), today, [...existingIds, session.id])
    setShowBuilder(false)
    setShowActivityBuilder(false)
  }

  const handlePlanSession = (_plan: WorkoutPlan, session: WorkoutSession) => {
    onSaveDayOverride(getWeekStart(), today, [...sessionIds, session.id])
    setShowAdder(false)
  }

  const handleRemoveSession = (origIdx: number) => {
    const newIds = sessionIds.filter((_, i) => i !== origIdx)
    onSaveDayOverride(getWeekStart(), today, newIds)
  }

  if (showBuilder) {
    return <AdHocWorkoutBuilder onSave={handleBuilderSave} onClose={() => setShowBuilder(false)} />
  }

  if (showActivityBuilder) {
    return <ActivityBuilder onSave={handleBuilderSave} onClose={() => setShowActivityBuilder(false)} />
  }

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
        onUpdatePlan={onUpdatePlan}
        onClose={() => setViewing(null)}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-14 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Hoje</h1>
        <p className="text-[#737373] text-sm mt-0.5 capitalize">{dateLabel}</p>
      </div>

      {active && (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#f97316]/30 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#f97316] rounded-full animate-pulse" />
            <p className="text-[#f97316] text-xs font-semibold uppercase tracking-wider">Treino em curso</p>
          </div>
          <p className="text-white font-bold text-lg">{active.session.name}</p>
          <p className="text-[#737373] text-sm mt-0.5">
            {active.session.kind === 'activity'
              ? activityTypeLabel(active.session.activity_type ?? 'other')
              : `${active.log.exercises.filter(e => e.sets.every(s => s.completed)).length}/${active.session.exercises.length} exercícios completos`}
          </p>
          <button onClick={onResume}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#f97316] rounded-xl text-white font-semibold hover:bg-[#ea6c0a] transition-colors">
            <Play size={18} fill="currentColor" />Continuar treino
          </button>
        </div>
      )}

      {todayLogs.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-3">Registado hoje</p>
          <div className="space-y-2">
            {todayLogs.map(log => {
              const completedSets = log.exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
              const totalSets = log.exercises.reduce((n, e) => n + e.sets.length, 0)
              const isActivity = log.kind === 'activity'
              return (
                <div key={log.id} className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{log.session_name}</p>
                      <p className="text-[10px] text-[#525252] mt-0.5 flex items-center gap-2">
                        <span>{isActivity ? activityTypeLabel(log.activity_type ?? 'other') : `${completedSets}/${totalSets} séries`}</span>
                        {log.duration_seconds != null && (
                          <span className="flex items-center gap-0.5"><Clock size={9} />{formatDurationSeconds(log.duration_seconds)}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button onClick={() => setEditingLog(log)} className="p-1.5 text-[#525252] hover:text-[#f97316]"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('Apagar este treino?')) onDeleteLog(log.id) }} className="p-1.5 text-[#525252] hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {(scheduled.length > 0 || hasAdHoc) ? (
        <div className="mb-6">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-3">Planeado para hoje</p>
          <div className="space-y-3">
            {scheduled.map(({ plan, session, origIdx }) => {
              const isActivity = session.kind === 'activity'
              const isDone = doneSessionIds.has(session.id)
              return (
                <div key={origIdx} className="bg-[#1a1a1a] rounded-2xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <button onClick={() => setViewing({ plan, session })} disabled={isActivity} className="flex-1 text-left disabled:cursor-default">
                      <p className="text-white font-semibold">{session.name}</p>
                      <p className="text-[#737373] text-xs mt-0.5">
                        {isActivity
                          ? `${activityTypeLabel(session.activity_type ?? 'other')}${session.planned_duration_minutes ? ` · ${session.planned_duration_minutes} min` : ''}`
                          : `${session.exercises.length} exercícios`}
                        {!isActivity && session.muscle_groups.length > 0 && ` · ${session.muscle_groups.map(muscleLabel).join(', ')}`}
                      </p>
                    </button>
                    <button onClick={() => handleRemoveSession(origIdx)} className="p-1.5 text-[#525252] hover:text-red-400 flex-shrink-0 -mt-0.5"><X size={15} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onCompleteQuick(plan, session)} disabled={isDone}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border rounded-xl text-sm font-semibold transition-colors ${isDone ? 'border-[#22c55e]/40 text-[#22c55e]' : 'border-[#2e2e2e] text-[#a3a3a3] hover:border-[#22c55e]/50 hover:text-[#22c55e]'}`}>
                      <Check size={15} />Feito
                    </button>
                    <button onClick={() => onStart(plan, session)} disabled={isDone}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isDone ? 'bg-[#1a1a1a] border border-[#2e2e2e] text-[#525252]' : 'bg-[#f97316] text-white hover:bg-[#ea6c0a]'}`}>
                      <Play size={15} fill="currentColor" />Iniciar
                    </button>
                  </div>
                </div>
              )
            })}
            {hasAdHoc && (
              <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-dashed border-[#f97316]/30">
                <p className="text-white font-semibold mb-0.5">Treino livre</p>
                <p className="text-[#737373] text-xs mb-3">Por configurar</p>
                <button onClick={() => setShowBuilder(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border border-[#f97316]/40 rounded-xl text-[#f97316] text-sm font-semibold hover:border-[#f97316]/70 transition-colors">
                  <Dumbbell size={15} />Configurar treino
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6 flex flex-col items-center py-10 text-center">
          <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-3"><Zap size={24} className="text-[#f97316]" /></div>
          <p className="text-white font-semibold">Sem treino planeado</p>
          <p className="text-[#737373] text-sm mt-1 max-w-xs">Adiciona um treino abaixo ou planeia a semana no separador Semana</p>
        </div>
      )}

      <button onClick={() => setShowAdder(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl text-[#a3a3a3] text-sm font-medium hover:border-[#f97316]/40 hover:text-[#f97316] transition-colors">
        <Plus size={15} />Adicionar treino
      </button>

      {showAdder && (
        <AddWorkoutSheet
          plans={plans}
          onAdHoc={() => { setShowAdder(false); setShowBuilder(true) }}
          onActivity={() => { setShowAdder(false); setShowActivityBuilder(true) }}
          onPlan={handlePlanSession}
          onClose={() => setShowAdder(false)}
        />
      )}
    </div>
  )
}
