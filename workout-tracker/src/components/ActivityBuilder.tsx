import { useState } from 'react'
import { X, Save, Play, Dumbbell } from 'lucide-react'
import type { ActivityType, WorkoutPlan, WorkoutSession } from '../types/workout'
import { activityTypeLabel } from '../utils/labels'
import { ADHOC_PLAN } from './AdHocWorkoutBuilder'

const ACTIVITY_TYPES: ActivityType[] = ['class', 'cardio', 'mobility', 'sport', 'other']

interface Props {
  onStart?: (plan: WorkoutPlan, session: WorkoutSession) => void
  onSave?: (plan: WorkoutPlan, session: WorkoutSession) => void
  onClose: () => void
}

export default function ActivityBuilder({ onStart, onSave, onClose }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState<ActivityType>('class')
  const [duration, setDuration] = useState('45')

  const buildSession = (): WorkoutSession => ({
    id: crypto.randomUUID(),
    name: name.trim() || 'Atividade livre',
    kind: 'activity',
    activity_type: type,
    planned_duration_minutes: duration ? Math.max(0, parseInt(duration) || 0) : undefined,
    muscle_groups: [],
    exercises: [],
  })

  const canSubmit = !!name.trim() || !!duration

  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-1 text-[#a3a3a3]"><X size={20} /></button>
        <h2 className="flex-1 text-white font-semibold">Atividade / Aula</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4 space-y-5">
        <div className="flex flex-col items-center py-3 text-center">
          <div className="w-14 h-14 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-3">
            <Dumbbell size={22} className="text-[#f97316]" />
          </div>
          <p className="text-white font-semibold">Registo simples</p>
          <p className="text-[#737373] text-sm mt-1">Ideal para Body Pump, corrida, caminhada, cycling, yoga ou aulas.</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome da atividade, ex: Body Pump"
            className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#f97316]"
          />

          <select
            value={type}
            onChange={e => setType(e.target.value as ActivityType)}
            className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#f97316]"
          >
            {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{activityTypeLabel(t)}</option>)}
          </select>

          <div className="space-y-1">
            <p className="text-[10px] text-[#525252] uppercase tracking-wider">Duração prevista (min)</p>
            <input type="number" min={0} inputMode="numeric" value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="45"
              className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#f97316]"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 px-4 pt-3 pb-8 border-t border-[#1a1a1a]">
        {onSave && (
          <button onClick={() => canSubmit && onSave(ADHOC_PLAN, buildSession())} disabled={!canSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white text-sm font-semibold disabled:opacity-40 hover:border-[#f97316]/40">
            <Save size={15} />Guardar
          </button>
        )}
        {onStart && (
          <button onClick={() => canSubmit && onStart(ADHOC_PLAN, buildSession())} disabled={!canSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#f97316] rounded-xl text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#ea6c0a]">
            <Play size={15} fill="currentColor" />Iniciar
          </button>
        )}
      </div>
    </div>
  )
}
