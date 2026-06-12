import type { WorkoutPlan, WorkoutSession, ActiveWorkout, WorkoutLog } from '../types/workout'
import TodayPage from './TodayPage'
import PlansPage from './PlansPage'
import HistoryPage from './HistoryPage'

export type WorkoutTab = 'hoje' | 'planos' | 'historico'

interface Props {
  tab: WorkoutTab
  onTabChange: (t: WorkoutTab) => void
  plans: WorkoutPlan[]
  active: ActiveWorkout | null
  logs: WorkoutLog[]
  onStart: (plan: WorkoutPlan, session: WorkoutSession) => void
  onResume: () => void
  onAddPlan: (plan: WorkoutPlan) => void
  onDeletePlan: (id: string) => void
  onDeleteLog: (id: string) => void
}

const TABS: { id: WorkoutTab; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'planos', label: 'Planos' },
  { id: 'historico', label: 'Histórico' },
]

export default function WorkoutPage({ tab, onTabChange, plans, active, logs, onStart, onResume, onAddPlan, onDeletePlan, onDeleteLog }: Props) {
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
          <TodayPage plans={plans} active={active} onStart={onStart} onResume={onResume} />
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
