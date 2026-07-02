import { useState } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import type { WorkoutPlan } from '../types/workout'
import PlanBuilder from '../components/PlanBuilder'
import PlanImportSection from '../components/workout/PlanImportSection'
import PlanCard from '../components/workout/PlanCard'
import AIPlanGenerator from '../components/AIPlanGenerator'

interface Props {
  plans: WorkoutPlan[]
  onAdd: (plan: WorkoutPlan) => void
  onDelete: (id: string) => void
}

type Mode = 'list' | 'builder' | 'ai-generator' | 'ai-review'

export default function PlansPage({ plans, onAdd, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('list')
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null)

  if (mode === 'builder') {
    return (
      <PlanBuilder
        onSave={plan => { onAdd(plan); setMode('list') }}
        onCancel={() => setMode('list')}
      />
    )
  }

  if (mode === 'ai-generator') {
    return (
      <AIPlanGenerator
        onGenerated={plan => { setGeneratedPlan(plan); setMode('ai-review') }}
        onClose={() => setMode('list')}
      />
    )
  }

  if (mode === 'ai-review' && generatedPlan) {
    return (
      <PlanBuilder
        initialPlan={generatedPlan}
        onSave={plan => { onAdd(plan); setMode('list'); setGeneratedPlan(null) }}
        onCancel={() => setMode('list')}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-14 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Planos</h1>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setMode('builder')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-sm text-[#a3a3a3] hover:border-[#f97316]/50 hover:text-white transition-colors"
        >
          <Plus size={15} />
          Novo plano
        </button>
        <button
          onClick={() => setMode('ai-generator')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#f97316]/10 border border-[#f97316]/30 rounded-xl text-sm text-[#f97316] hover:bg-[#f97316]/20 transition-colors"
        >
          <Sparkles size={15} />
          Gerar com IA
        </button>
      </div>

      <PlanImportSection onAdd={onAdd} onCreateClick={() => setMode('builder')} />

      {plans.length === 0 ? (
        <p className="text-center text-[#525252] text-sm py-8">Sem planos — cria um ou gera com IA</p>
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
