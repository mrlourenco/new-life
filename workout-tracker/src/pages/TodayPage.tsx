import { Play, Zap } from 'lucide-react'
import type { WorkoutPlan, WorkoutSession, ActiveWorkout } from '../types/workout'

interface Props {
  plans: WorkoutPlan[]
  active: ActiveWorkout | null
  onStart: (plan: WorkoutPlan, session: WorkoutSession) => void
  onResume: () => void
}

const MUSCLE_COLORS: Record<string, string> = {
  chest: 'bg-red-900/40 text-red-400',
  back: 'bg-blue-900/40 text-blue-400',
  legs: 'bg-green-900/40 text-green-400',
  shoulders: 'bg-yellow-900/40 text-yellow-400',
  arms: 'bg-purple-900/40 text-purple-400',
  triceps: 'bg-purple-900/40 text-purple-400',
  biceps: 'bg-indigo-900/40 text-indigo-400',
  core: 'bg-orange-900/40 text-orange-400',
  glutes: 'bg-pink-900/40 text-pink-400',
  cardio: 'bg-cyan-900/40 text-cyan-400',
}

function muscleClass(m: string) {
  return MUSCLE_COLORS[m.toLowerCase()] ?? 'bg-[#2e2e2e] text-[#a3a3a3]'
}

export default function TodayPage({ plans, active, onStart, onResume }: Props) {
  const today = new Date().getDay()

  const todaySessions = plans.flatMap(plan =>
    plan.sessions
      .filter(s => s.day_of_week === today)
      .map(s => ({ plan, session: s }))
  )

  if (active) {
    return (
      <div className="flex-1 flex flex-col px-4 pt-14 pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Hoje</h1>
          <p className="text-[#737373] text-sm mt-0.5">{new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#f97316]/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#f97316] rounded-full animate-pulse" />
            <p className="text-[#f97316] text-xs font-semibold uppercase tracking-wider">Treino em curso</p>
          </div>
          <p className="text-white font-bold text-lg">{active.session.name}</p>
          <p className="text-[#737373] text-sm mt-0.5">
            {active.log.exercises.filter(e => e.sets.every(s => s.completed)).length}/{active.session.exercises.length} exercícios completos
          </p>
          <button
            onClick={onResume}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#f97316] rounded-xl text-white font-semibold hover:bg-[#ea6c0a] transition-colors"
          >
            <Play size={18} fill="currentColor" />
            Continuar treino
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-14 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Hoje</h1>
        <p className="text-[#737373] text-sm mt-0.5">{new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {todaySessions.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-3">Agendado para hoje</p>
          <div className="space-y-3">
            {todaySessions.map(({ plan, session }) => (
              <SessionCard key={session.id} plan={plan} session={session} onStart={onStart} />
            ))}
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
            <Zap size={28} className="text-[#f97316]" />
          </div>
          <p className="text-white font-semibold text-lg">Sem planos de treino</p>
          <p className="text-[#737373] text-sm mt-1 max-w-xs">Importa um plano JSON no separador Planos para começar</p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-3">Todos os treinos</p>
          <div className="space-y-2">
            {plans.flatMap(plan =>
              plan.sessions.map(session => (
                <SessionCard key={session.id} plan={plan} session={session} onStart={onStart} compact />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SessionCard({ plan, session, onStart, compact = false }: {
  plan: WorkoutPlan
  session: WorkoutSession
  onStart: (p: WorkoutPlan, s: WorkoutSession) => void
  compact?: boolean
}) {
  return (
    <div className={`bg-[#1a1a1a] rounded-2xl p-4 ${compact ? '' : 'border border-[#2e2e2e]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{session.name}</p>
          <p className="text-[#737373] text-xs mt-0.5">{plan.name}</p>
          {!compact && (
            <>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {session.muscle_groups.map(m => (
                  <span key={m} className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${muscleClass(m)}`}>{m}</span>
                ))}
              </div>
              <p className="text-[#525252] text-xs mt-2">{session.exercises.length} exercícios</p>
            </>
          )}
        </div>
        <button
          onClick={() => onStart(plan, session)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#f97316] rounded-xl text-white text-xs font-semibold hover:bg-[#ea6c0a] transition-colors"
        >
          <Play size={14} fill="currentColor" />
          {compact ? '' : 'Iniciar'}
        </button>
      </div>
    </div>
  )
}
