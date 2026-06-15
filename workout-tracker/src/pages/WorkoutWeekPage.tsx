import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Pencil, Check, Calendar, Dumbbell, CheckCircle2, Play, Plus } from 'lucide-react'
import type { WorkoutPlan, WorkoutSession, WorkoutLog, WorkoutWeekAssignment } from '../types/workout'
import { getWeekDates } from '../utils/dates'
import { getDaySessionIds, findSession } from '../utils/workout'
import { muscleLabel } from '../utils/labels'
import SessionDetail from '../components/workout/SessionDetail'
import AdHocWorkoutBuilder from '../components/AdHocWorkoutBuilder'

interface Props {
  today: string
  plans: WorkoutPlan[]
  logs: WorkoutLog[]
  weekStartDay: 0 | 1
  assignments: WorkoutWeekAssignment[]
  onAssignPlan: (weekStart: string, planId: string | null) => void
  onSaveDayOverride: (weekStart: string, date: string, sessionIds: string[]) => void
  onUpdatePlan: (plan: WorkoutPlan) => void
}

function PlanPicker({ plans, currentPlanId, onSelect, onClose }: {
  plans: WorkoutPlan[]
  currentPlanId?: string
  onSelect: (planId: string | null) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end" onClick={onClose}>
      <div className="bg-[#0f0f0f] rounded-t-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#1a1a1a]">
          <h3 className="text-white font-semibold">Associar plano à semana</h3>
          <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto max-h-80 px-4 py-3 space-y-2 pb-6">
          <button onClick={() => onSelect(null)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${!currentPlanId ? 'border-[#f97316] bg-[#f97316]/10' : 'border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#3f3f3f]'}`}>
            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-medium">Sem plano</p>
              {!currentPlanId && <Check size={14} className="text-[#f97316]" />}
            </div>
            <p className="text-xs text-[#737373] mt-0.5">Planear os dias individualmente</p>
          </button>
          {plans.map(plan => (
            <button key={plan.id} onClick={() => onSelect(plan.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${currentPlanId === plan.id ? 'border-[#f97316] bg-[#f97316]/10' : 'border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#3f3f3f]'}`}>
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">{plan.name}</p>
                {currentPlanId === plan.id && <Check size={14} className="text-[#f97316]" />}
              </div>
              <p className="text-xs text-[#525252] mt-0.5">{plan.sessions.length} sessões</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function DaySessionEditor({ date, currentSessionIds, hasOverride, plans, onSave, onClearOverride, onClose, onUpdatePlan }: {
  date: string
  currentSessionIds: string[]
  hasOverride: boolean
  plans: WorkoutPlan[]
  onSave: (sessionIds: string[]) => void
  onClearOverride: () => void
  onClose: () => void
  onUpdatePlan: (plan: WorkoutPlan) => void
}) {
  // Filter out the 'adhoc' placeholder; configured ad-hoc sessions have real UUIDs
  const [selected, setSelected] = useState<Set<string>>(new Set(currentSessionIds.filter(id => id !== 'adhoc')))
  const [showBuilder, setShowBuilder] = useState(false)

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const handleBuilderSave = (_plan: WorkoutPlan, session: WorkoutSession) => {
    const existingAdhoc = plans.find(p => p.id === 'adhoc')
    onUpdatePlan({
      id: 'adhoc',
      name: 'Avulso',
      goal: 'general',
      days_per_week: 0,
      sessions: [...(existingAdhoc?.sessions ?? []), session],
    })
    setSelected(prev => new Set([...prev, session.id]))
    setShowBuilder(false)
  }

  if (showBuilder) {
    return (
      <AdHocWorkoutBuilder
        onSave={handleBuilderSave}
        onClose={() => setShowBuilder(false)}
      />
    )
  }

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
  const adhocPlan = plans.find(p => p.id === 'adhoc')
  // Show only selected ad-hoc sessions (already assigned to this day) — not all saved ones
  const selectedAdhocSessions = (adhocPlan?.sessions ?? []).filter(s => selected.has(s.id))
  const byPlan = plans.filter(p => p.id !== 'adhoc').map(plan => ({ plan, sessions: plan.sessions })).filter(g => g.sessions.length > 0)

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <div className="flex-1">
          <h2 className="text-white font-semibold">Planear dia</h2>
          <p className="text-xs text-[#737373] capitalize">{dateLabel}</p>
        </div>
        <button onClick={() => onSave(Array.from(selected))}
          className="px-4 py-1.5 bg-[#f97316] rounded-xl text-white text-sm font-semibold">
          Guardar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-4">
        {hasOverride && (
          <button onClick={onClearOverride}
            className="w-full py-2.5 rounded-xl text-xs font-medium text-[#737373] border border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#f97316]/40 hover:text-[#f97316]">
            Repor para padrão do plano
          </button>
        )}

        {/* Ad-hoc section */}
        <div className="space-y-2">
          <p className="text-[11px] text-[#525252] font-semibold uppercase tracking-wider">Treino livre</p>
          {selectedAdhocSessions.map(s => (
            <button key={s.id} onClick={() => toggle(s.id)}
              className="w-full text-left px-4 py-3 rounded-xl border border-[#f97316] bg-[#f97316]/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#f97316] bg-[#f97316] flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-black" />
                </div>
                <Dumbbell size={13} className="text-[#f97316] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{s.name}</p>
                  <p className="text-[10px] text-[#525252]">{s.exercises.length} exercícios{s.muscle_groups.length > 0 ? ` · ${s.muscle_groups.map(muscleLabel).join(', ')}` : ''}</p>
                </div>
              </div>
            </button>
          ))}
          <button onClick={() => setShowBuilder(true)}
            className="w-full flex items-center gap-3 px-4 py-3 border border-dashed border-[#2e2e2e] bg-[#1a1a1a] rounded-xl hover:border-[#f97316]/40 transition-colors">
            <Plus size={14} className="text-[#f97316] flex-shrink-0" />
            <p className="text-sm text-[#a3a3a3]">Criar treino livre</p>
          </button>
        </div>

        {byPlan.length === 0 && (
          <p className="text-center text-[#525252] text-sm py-2">Sem planos. Cria um no separador Planos.</p>
        )}

        {byPlan.map(({ plan, sessions }) => (
          <div key={plan.id} className="space-y-2">
            <p className="text-[11px] text-[#525252] font-semibold uppercase tracking-wider">{plan.name}</p>
            {sessions.map(s => {
              const isSelected = selected.has(s.id)
              return (
                <button key={s.id} onClick={() => toggle(s.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${isSelected ? 'border-[#f97316] bg-[#f97316]/10' : 'border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#3f3f3f]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#f97316] bg-[#f97316]' : 'border-[#3f3f3f]'}`}>
                      {isSelected && <Check size={10} className="text-black" />}
                    </div>
                    <Dumbbell size={13} className="text-[#f97316] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[#a3a3a3]'}`}>{s.name}</p>
                      <p className="text-[10px] text-[#525252]">{s.exercises.length} exercícios · {s.muscle_groups.map(muscleLabel).join(', ')}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WorkoutWeekPage({ today, plans, logs, weekStartDay, assignments, onAssignPlan, onSaveDayOverride, onUpdatePlan }: Props) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [showPlanPicker, setShowPlanPicker] = useState(false)
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [viewing, setViewing] = useState<{ plan: WorkoutPlan; session: WorkoutSession } | null>(null)

  const anchorDate = new Date(today + 'T12:00:00')
  anchorDate.setDate(anchorDate.getDate() + weekOffset * 7)
  const anchor = anchorDate.toISOString().slice(0, 10)

  const weekDates = getWeekDates(anchor, weekStartDay)
  const weekStart = weekDates[0]
  const weekStartD = new Date(weekDates[0] + 'T12:00:00')
  const weekEnd = new Date(weekDates[6] + 'T12:00:00')
  const weekLabel = `${weekStartD.getDate()} ${weekStartD.toLocaleDateString('pt-PT', { month: 'short' })} – ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('pt-PT', { month: 'short' })}`

  const assignment = assignments.find(a => a.week_start === weekStart)
  const assignedPlan = plans.find(p => p.id === assignment?.plan_id)

  const handleAssignPlan = (planId: string | null) => {
    onAssignPlan(weekStart, planId)
    setShowPlanPicker(false)
  }

  const handleSaveDayOverride = (sessionIds: string[]) => {
    if (!editingDate) return
    onSaveDayOverride(weekStart, editingDate, sessionIds)
    setEditingDate(null)
  }

  const handleClearDayOverride = () => {
    if (!editingDate) return
    onSaveDayOverride(weekStart, editingDate, [])
    setEditingDate(null)
  }

  if (viewing) {
    return (
      <SessionDetail
        plan={viewing.plan}
        session={viewing.session}
        onUpdatePlan={onUpdatePlan}
        onClose={() => setViewing(null)}
      />
    )
  }

  if (editingDate) {
    const currentSessionIds = getDaySessionIds(editingDate, assignments, plans, weekStartDay)
    const hasOverride = assignment?.day_overrides.some(o => o.date === editingDate) ?? false
    return (
      <DaySessionEditor
        date={editingDate}
        currentSessionIds={currentSessionIds}
        hasOverride={hasOverride}
        plans={plans}
        onSave={handleSaveDayOverride}
        onClearOverride={handleClearDayOverride}
        onClose={() => setEditingDate(null)}
        onUpdatePlan={onUpdatePlan}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Week navigation bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0f0f0f]">
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 text-[#525252] hover:text-white">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs font-semibold text-white">{weekLabel}</p>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-[10px] text-[#f97316]">← esta semana</button>
          )}
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 text-[#525252] hover:text-white">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Plan assignment bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar size={13} className="text-[#525252] flex-shrink-0" />
          {assignedPlan
            ? <p className="text-xs text-white font-medium truncate">{assignedPlan.name}</p>
            : <p className="text-xs text-[#525252]">Sem plano atribuído a esta semana</p>
          }
        </div>
        <button onClick={() => setShowPlanPicker(true)}
          className="text-xs text-[#f97316] font-medium hover:text-[#fb923c] flex-shrink-0 ml-3">
          {assignedPlan ? 'Mudar' : 'Atribuir'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-2">
        {weekDates.map(date => {
          const isToday = date === today
          const sessionIds = getDaySessionIds(date, assignments, plans, weekStartDay)
          const hasAdHoc = sessionIds.includes('adhoc')
          const daySessions = sessionIds
            .filter(id => id !== 'adhoc')
            .map(id => findSession(plans, id))
            .filter(Boolean) as { plan: WorkoutPlan; session: WorkoutSession }[]
          const doneSessionIds = new Set(logs.filter(l => l.date === date).map(l => l.session_id))
          const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })
          const hasOverride = assignment?.day_overrides.some(o => o.date === date) ?? false
          const totalCount = daySessions.length + (hasAdHoc ? 1 : 0)

          return (
            <div key={date} className={`rounded-2xl overflow-hidden ${isToday ? 'ring-1 ring-[#f97316]' : ''}`}>
              <div className={`flex items-center justify-between px-4 py-2.5 ${isToday ? 'bg-[#2a1505]' : 'bg-[#1a1a1a]'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  {isToday && <span className="text-[9px] bg-[#f97316] text-black font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">HOJE</span>}
                  {hasOverride && <span className="text-[9px] bg-[#60a5fa]/20 text-[#60a5fa] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">custom</span>}
                  <p className={`text-sm font-semibold capitalize truncate ${isToday ? 'text-[#f97316]' : 'text-white'}`}>{dateLabel}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <p className="text-xs text-[#737373]">{totalCount === 0 ? 'Descanso' : `${totalCount} sessão(ões)`}</p>
                  <button onClick={() => setEditingDate(date)} className="p-1.5 text-[#525252] hover:text-[#f97316]">
                    <Pencil size={13} />
                  </button>
                </div>
              </div>

              {(daySessions.length > 0 || hasAdHoc) ? (
                <div className="bg-[#131313] px-3 pb-2 pt-1 space-y-0.5">
                  {daySessions.map(({ plan: sessionPlan, session: s }) => {
                    const done = doneSessionIds.has(s.id)
                    return (
                      <button key={s.id} onClick={() => setViewing({ plan: sessionPlan, session: s })}
                        className="w-full flex items-center gap-2 py-1.5 text-left">
                        <Dumbbell size={11} className="text-[#f97316] flex-shrink-0" />
                        <p className="text-xs text-[#a3a3a3] flex-1 truncate">{s.name}</p>
                        <span className="text-[10px] text-[#525252] flex-shrink-0">{s.exercises.length} ex.</span>
                        {done && <CheckCircle2 size={12} className="text-[#22c55e] flex-shrink-0" />}
                      </button>
                    )
                  })}
                  {hasAdHoc && (
                    <div className="flex items-center gap-2 py-1.5">
                      <Play size={11} className="text-[#f97316] flex-shrink-0" fill="currentColor" />
                      <p className="text-xs text-[#a3a3a3] flex-1 italic">Treino livre</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#131313] px-4 py-2">
                  <p className="text-[10px] text-[#3f3f3f]">Dia de descanso</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showPlanPicker && (
        <PlanPicker
          plans={plans}
          currentPlanId={assignment?.plan_id}
          onSelect={handleAssignPlan}
          onClose={() => setShowPlanPicker(false)}
        />
      )}
    </div>
  )
}
