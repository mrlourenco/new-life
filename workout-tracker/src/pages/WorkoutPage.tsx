import type { WorkoutPlan, WorkoutSession, ActiveWorkout, WorkoutLog, WorkoutWeekAssignment } from '../types/workout'
import TodayPage from './TodayPage'
import WorkoutWeekPage from './WorkoutWeekPage'
import PlansPage from './PlansPage'
import HistoryPage from './HistoryPage'

export type WorkoutTab = 'hoje' | 'semana' | 'planos' | 'historico'

interface Props {
  tab: WorkoutTab
  onTabChange: (t: WorkoutTab) => void
  today: string
  weekStartDay: 0 | 1
  plans: WorkoutPlan[]
  active: ActiveWorkout | null
  logs: WorkoutLog[]
  assignments: WorkoutWeekAssignment[]
  onStart: (plan: WorkoutPlan, session: WorkoutSession) => void
  onResume: () => void
  onAddPlan: (plan: WorkoutPlan) => void
  onDeletePlan: (id: string) => void
  onUpdateLog: (log: WorkoutLog) => void
  onDeleteLog: (id: string) => void
  onAssignPlan: (weekStart: string, planId: string | null) => void
  onSaveDayOverride: (weekStart: string, date: string, sessionIds: string[]) => void
}

const TABS: { id: WorkoutTab; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Semana' },
  { id: 'planos', label: 'Planos' },
  { id: 'historico', label: 'Histórico' },
]

export default function WorkoutPage({
  tab, onTabChange, today, weekStartDay, plans, active, logs, assignments,
  onStart, onResume, onAddPlan, onDeletePlan, onUpdateLog, onDeleteLog, onAssignPlan, onSaveDayOverride,
}: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-[#1a1a1a] px-2 pt-12 bg-[#0f0f0f]">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${
              tab === id ? 'text-[#f97316] border-[#f97316]' : 'text-[#525252] border-transparent hover:text-[#a3a3a3]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === 'hoje' && (
          <TodayPage
            today={today} plans={plans} active={active} logs={logs}
            assignments={assignments} weekStartDay={weekStartDay}
            onStart={onStart} onResume={onResume} onUpdateLog={onUpdateLog} onDeleteLog={onDeleteLog}
            onUpdatePlan={onAddPlan} onSaveDayOverride={onSaveDayOverride}
          />
        )}
        {tab === 'semana' && (
          <WorkoutWeekPage
            today={today} plans={plans} logs={logs} weekStartDay={weekStartDay}
            assignments={assignments} onAssignPlan={onAssignPlan} onSaveDayOverride={onSaveDayOverride}
            onUpdatePlan={onAddPlan}
          />
        )}
        {tab === 'planos' && (
          <PlansPage plans={plans} onAdd={onAddPlan} onDelete={onDeletePlan} />
        )}
        {tab === 'historico' && (
          <HistoryPage logs={logs} onDelete={onDeleteLog} />
        )}
      </div>
    </div>
  )
}
