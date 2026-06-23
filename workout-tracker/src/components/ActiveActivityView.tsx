import { useEffect, useState } from 'react'
import { X, Clock, CheckCircle2, Flame, StickyNote } from 'lucide-react'
import type { ActiveWorkout, ActivityIntensity } from '../types/workout'
import { formatElapsedSince } from '../utils/format'
import { activityTypeLabel, activityIntensityLabel } from '../utils/labels'

interface Props {
  active: ActiveWorkout
  onUpdate: (w: ActiveWorkout) => void
  onFinish: (w: ActiveWorkout) => void
  onDiscard: () => void
}

const INTENSITIES: ActivityIntensity[] = ['light', 'moderate', 'hard']

export default function ActiveActivityView({ active, onUpdate, onFinish, onDiscard }: Props) {
  const [elapsed, setElapsed] = useState(() => formatElapsedSince(active.log.started_at))

  useEffect(() => {
    const interval = setInterval(() => setElapsed(formatElapsedSince(active.log.started_at)), 1000)
    return () => clearInterval(interval)
  }, [active.log.started_at])

  const updateLog = (patch: Partial<ActiveWorkout['log']>) => {
    onUpdate({ ...active, log: { ...active.log, ...patch } })
  }

  const handleFinish = () => {
    const now = new Date().toISOString()
    const duration = Math.floor((new Date(now).getTime() - new Date(active.log.started_at).getTime()) / 1000)
    onFinish({
      ...active,
      log: { ...active.log, finished_at: now, duration_seconds: duration, kind: 'activity' },
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onDiscard} className="p-2 -ml-2 text-[#737373] hover:text-[#f97316]">
          <X size={20} />
        </button>
        <div className="text-center min-w-0">
          <p className="font-semibold text-sm text-white truncate max-w-[180px]">{active.session.name}</p>
          <p className="text-xs text-[#737373] flex items-center gap-1 justify-center mt-0.5">
            <Clock size={10} />{elapsed}
          </p>
        </div>
        <button onClick={handleFinish}
          className="px-3 py-1.5 rounded-lg bg-[#f97316] text-white text-xs font-semibold hover:bg-[#ea6c0a] transition-colors">
          Terminar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        <div className="bg-[#1a1a1a] rounded-3xl p-5 text-center border border-[#2e2e2e]">
          <div className="w-16 h-16 rounded-full bg-[#f97316]/10 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 size={30} className="text-[#f97316]" />
          </div>
          <h1 className="text-2xl font-bold text-white">{active.session.name}</h1>
          <p className="text-[#737373] text-sm mt-1">{activityTypeLabel(active.session.activity_type ?? 'other')}</p>
          {active.session.planned_duration_minutes != null && (
            <p className="text-[#a3a3a3] text-xs mt-3">Planeado: {active.session.planned_duration_minutes} min</p>
          )}
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
          <p className="text-xs text-[#737373] font-semibold uppercase tracking-wider">Intensidade</p>
          <div className="grid grid-cols-3 gap-2">
            {INTENSITIES.map(i => (
              <button key={i}
                onClick={() => updateLog({ activity_intensity: i })}
                className={`py-2.5 rounded-xl text-xs font-semibold border ${active.log.activity_intensity === i ? 'bg-[#f97316] border-[#f97316] text-white' : 'bg-[#0f0f0f] border-[#2e2e2e] text-[#a3a3a3]'}`}>
                {activityIntensityLabel(i)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
          <label className="flex items-center gap-2 text-xs text-[#737373] font-semibold uppercase tracking-wider">
            <Flame size={13} className="text-[#f97316]" />Calorias opcionais
          </label>
          <input type="number" min={0} inputMode="numeric" value={active.log.activity_calories ?? ''}
            onChange={e => updateLog({ activity_calories: e.target.value ? parseInt(e.target.value) || 0 : undefined })}
            placeholder="Ex: 350"
            className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#f97316]" />
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
          <label className="flex items-center gap-2 text-xs text-[#737373] font-semibold uppercase tracking-wider">
            <StickyNote size={13} className="text-[#f97316]" />Notas
          </label>
          <textarea value={active.log.activity_notes ?? ''}
            onChange={e => updateLog({ activity_notes: e.target.value })}
            placeholder="Como correu? Carga, sensação, dificuldade..."
            rows={4}
            className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#f97316] resize-none" />
        </div>
      </div>
    </div>
  )
}
