import { useState } from 'react'
import type { MealTemplate, DayNutritionLog, NutritionPlan, WeekAssignment } from '../types/nutrition'
import type { MacroTargets } from '../types/profile'
import NutritionTodayPage from './nutrition/NutritionTodayPage'
import NutritionWeekPage from './nutrition/NutritionWeekPage'
import NutritionLibraryPage from './nutrition/NutritionLibraryPage'
import NutritionPlansPage from './nutrition/NutritionPlansPage'

type NutritionTab = 'today' | 'week' | 'library' | 'plans'

interface Props {
  today: string
  templates: MealTemplate[]
  logs: DayNutritionLog[]
  plans: NutritionPlan[]
  assignments: WeekAssignment[]
  macroTargets: MacroTargets
  weekStartDay: 0 | 1
  onSaveLog: (log: DayNutritionLog) => void
  onSaveTemplate: (t: MealTemplate) => void
  onDeleteTemplate: (id: string) => void
  onImportTemplates: (templates: MealTemplate[]) => void
  onSavePlan: (plan: NutritionPlan) => void
  onDeletePlan: (id: string) => void
  onAssignPlan: (weekStart: string, planId: string | null) => void
  onSaveDayOverride: (weekStart: string, date: string, templateIds: string[]) => void
}

const TABS: { id: NutritionTab; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Semana' },
  { id: 'library', label: 'Refeições' },
  { id: 'plans', label: 'Planos' },
]

export default function NutritionPage({
  today, templates, logs, plans, assignments, macroTargets, weekStartDay,
  onSaveLog, onSaveTemplate, onDeleteTemplate, onImportTemplates,
  onSavePlan, onDeletePlan, onAssignPlan, onSaveDayOverride,
}: Props) {
  const [tab, setTab] = useState<NutritionTab>('today')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-[#1a1a1a] px-2 pt-12 bg-[#0f0f0f]">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${
              tab === id ? 'text-[#22c55e] border-[#22c55e]' : 'text-[#525252] border-transparent hover:text-[#a3a3a3]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === 'today' && (
          <NutritionTodayPage
            today={today} templates={templates} logs={logs} plans={plans}
            assignments={assignments} weekStartDay={weekStartDay}
            macroTargets={macroTargets}
            onSaveLog={onSaveLog} onSaveTemplate={onSaveTemplate}
          />
        )}
        {tab === 'week' && (
          <NutritionWeekPage
            today={today} plans={plans} templates={templates} weekStartDay={weekStartDay}
            assignments={assignments}
            onAssignPlan={onAssignPlan}
            onSaveDayOverride={onSaveDayOverride}
          />
        )}
        {tab === 'library' && (
          <NutritionLibraryPage
            templates={templates} onSave={onSaveTemplate} onDelete={onDeleteTemplate} onImport={onImportTemplates}
          />
        )}
        {tab === 'plans' && (
          <NutritionPlansPage
            plans={plans} templates={templates} logs={logs}
            onSave={onSavePlan} onDelete={onDeletePlan}
            onImportTemplates={onImportTemplates}
          />
        )}
      </div>
    </div>
  )
}
