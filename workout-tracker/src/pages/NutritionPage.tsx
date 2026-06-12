import { useState } from 'react'
import type { MealPlan, DayNutritionLog } from '../types/nutrition'
import NutritionTodayPage from './nutrition/NutritionTodayPage'
import NutritionWeekPage from './nutrition/NutritionWeekPage'
import NutritionHistoryPage from './nutrition/NutritionHistoryPage'
import NutritionPlansPage from './nutrition/NutritionPlansPage'

type NutritionTab = 'today' | 'week' | 'history' | 'plans'

interface Props {
  plans: MealPlan[]
  logs: DayNutritionLog[]
  today: string
  onSaveLog: (log: DayNutritionLog) => void
  onDeleteLog: (id: string) => void
  onAddPlan: (plan: MealPlan) => void
  onDeletePlan: (id: string) => void
}

const TABS: { id: NutritionTab; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Semana' },
  { id: 'history', label: 'Histórico' },
  { id: 'plans', label: 'Planos' },
]

export default function NutritionPage({ plans, logs, today, onSaveLog, onDeleteLog, onAddPlan, onDeletePlan }: Props) {
  const [tab, setTab] = useState<NutritionTab>('today')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-tab bar */}
      <div className="flex border-b border-[#1a1a1a] px-4 pt-12 bg-[#0f0f0f]">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${
              tab === id
                ? 'text-[#22c55e] border-[#22c55e]'
                : 'text-[#525252] border-transparent hover:text-[#a3a3a3]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === 'today' && (
          <NutritionTodayPage
            plans={plans}
            logs={logs}
            today={today}
            onSaveLog={onSaveLog}
          />
        )}
        {tab === 'week' && (
          <NutritionWeekPage
            plans={plans}
            logs={logs}
            today={today}
          />
        )}
        {tab === 'history' && (
          <NutritionHistoryPage
            plans={plans}
            logs={logs}
            onDeleteLog={onDeleteLog}
          />
        )}
        {tab === 'plans' && (
          <NutritionPlansPage
            plans={plans}
            logs={logs}
            onAdd={onAddPlan}
            onDelete={onDeletePlan}
          />
        )}
      </div>
    </div>
  )
}
