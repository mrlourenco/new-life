import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { WorkoutPlan } from '../../types/workout'

interface Props {
  plan: WorkoutPlan
  expanded: boolean
  onToggle: () => void
  onDelete: () => void
}

const GOAL_LABELS: Record<string, string> = {
  strength: 'Força',
  hypertrophy: 'Hipertrofia',
  endurance: 'Resistência',
  general: 'Geral',
}

export default function PlanCard({ plan, expanded, onToggle, onDelete }: Props) {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          className="flex-1 text-left"
          onClick={onToggle}
        >
          <p className="text-white font-semibold">{plan.name}</p>
          <p className="text-[#737373] text-xs mt-0.5">
            {GOAL_LABELS[plan.goal] ?? plan.goal} · {plan.days_per_week}×/semana · {plan.sessions.length} sessões
          </p>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onDelete} className="p-2 text-[#525252] hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
          <button onClick={onToggle} className="p-2 text-[#525252]">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#2e2e2e] px-4 py-3 space-y-2">
          {plan.description && <p className="text-[#737373] text-xs mb-3">{plan.description}</p>}
          {plan.sessions.map(session => (
            <div key={session.id} className="bg-[#0f0f0f] rounded-xl px-3 py-2.5">
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">{session.name}</p>
                {session.day_of_week !== undefined && (
                  <span className="text-[10px] text-[#737373]">
                    {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][session.day_of_week]}
                  </span>
                )}
              </div>
              <p className="text-[#525252] text-xs mt-1">{session.exercises.length} exercícios</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {session.exercises.slice(0, 4).map(e => (
                  <span key={e.id} className="text-[10px] text-[#737373]">{e.name}</span>
                ))}
                {session.exercises.length > 4 && (
                  <span className="text-[10px] text-[#525252]">+{session.exercises.length - 4} mais</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
