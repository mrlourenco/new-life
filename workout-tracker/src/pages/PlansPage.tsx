import { useState } from 'react'
import type { WorkoutPlan } from '../types/workout'
import PlanBuilder from '../components/PlanBuilder'
import PlanImportSection from '../components/workout/PlanImportSection'
import PlanCard from '../components/workout/PlanCard'

interface Props {
  plans: WorkoutPlan[]
  onAdd: (plan: WorkoutPlan) => void
  onDelete: (id: string) => void
}

export default function PlansPage({ plans, onAdd, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)

  if (showBuilder) {
    return (
      <PlanBuilder
        onSave={plan => { onAdd(plan); setShowBuilder(false) }}
        onCancel={() => setShowBuilder(false)}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-14 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Planos</h1>
      </div>

      <PlanImportSection onAdd={onAdd} onCreateClick={() => setShowBuilder(true)} />

      {/* Plans list */}
      {plans.length === 0 ? (
        <p className="text-center text-[#525252] text-sm py-8">Sem planos importados</p>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              expanded={expanded === plan.id}
              onToggle={() => setExpanded(expanded === plan.id ? null : plan.id)}
              onDelete={() => onDelete(plan.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
