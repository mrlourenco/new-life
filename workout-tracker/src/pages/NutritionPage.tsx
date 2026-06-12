import { useState } from 'react'
import type { MealTemplate, DayNutritionLog, NutritionPlan } from '../types/nutrition'
import NutritionTodayPage from './nutrition/NutritionTodayPage'
import NutritionEvolutionPage from './nutrition/NutritionEvolutionPage'
import NutritionLibraryPage from './nutrition/NutritionLibraryPage'
import NutritionPlansPage from './nutrition/NutritionPlansPage'
import type { MacroTargets } from '../types/profile'

type NutritionTab = 'today' | 'evolution' | 'library' | 'plans'

interface Props {
  today: string
  templates: MealTemplate[]
  logs: DayNutritionLog[]
  plans: NutritionPlan[]
  macroTargets: MacroTargets
  onSaveLog: (log: DayNutritionLog) => void
  onDeleteLog: (id: string) => void
  onSaveTemplate: (t: MealTemplate) => void
  onDeleteTemplate: (id: string) => void
  onImportTemplates: (templates: MealTemplate[]) => void
  onSavePlan: (plan: NutritionPlan) => void
  onDeletePlan: (id: string) => void
  onActivatePlan: (id: string | null) => void
}

const TABS: { id: NutritionTab; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: 'evolution', label: 'Evolução' },
  { id: 'library', label: 'Refeições' },
  { id: 'plans', label: 'Planos' },
]

export default function NutritionPage({
  today, templates, logs, plans, macroTargets,
  onSaveLog, onDeleteLog,
  onSaveTemplate, onDeleteTemplate, onImportTemplates,
  onSavePlan, onDeletePlan, onActivatePlan,
}: Props) {
  const [tab, setTab] = useState<NutritionTab>('today')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-[#1a1a1a] px-2 pt-12 bg-[#0f0f0f]">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${
              tab === id ? 'text-[#22c55e] border-[#22c55e]' : 'text-[#525252] border-transparent hover:text-[#a3a3a3]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === 'today' && (
          <NutritionTodayPage
            today={today} templates={templates} logs={logs} plans={plans}
            macroTargets={macroTargets}
            onSaveLog={onSaveLog} onSaveTemplate={onSaveTemplate}
          />
        )}
        {tab === 'evolution' && (
          <NutritionEvolutionPage
            logs={logs} plans={plans} today={today} onDeleteLog={onDeleteLog}
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
            onSave={onSavePlan} onDelete={onDeletePlan} onActivate={onActivatePlan}
            onImportTemplates={onImportTemplates}
          />
        )}
      </div>
    </div>
  )
}
