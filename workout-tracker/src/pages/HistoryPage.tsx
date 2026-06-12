import { Trash2, Clock, Trophy, TrendingUp } from 'lucide-react'
import type { WorkoutLog } from '../types/workout'

interface Props {
  logs: WorkoutLog[]
  onDelete: (id: string) => void
}

function formatDuration(s?: number) {
  if (!s) return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

function totalVolume(log: WorkoutLog) {
  let vol = 0
  for (const ex of log.exercises) {
    for (const s of ex.sets) {
      if (s.completed && s.weight_kg && s.reps_done) {
        vol += s.weight_kg * s.reps_done
      }
    }
  }
  return vol
}

export default function HistoryPage({ logs, onDelete }: Props) {
  if (logs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
          <Trophy size={28} className="text-[#f97316]" />
        </div>
        <p className="text-white font-semibold text-lg">Sem histórico</p>
        <p className="text-[#737373] text-sm mt-1">Os treinos concluídos aparecem aqui</p>
      </div>
    )
  }

  const totalWorkouts = logs.length
  const totalMins = logs.reduce((acc, l) => acc + (l.duration_seconds ?? 0), 0)
  const totalVol = logs.reduce((acc, l) => acc + totalVolume(l), 0)

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-14 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Histórico</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Treinos" value={totalWorkouts.toString()} />
        <StatCard label="Tempo total" value={formatDuration(totalMins)} />
        <StatCard label="Volume (kg)" value={totalVol > 0 ? `${Math.round(totalVol / 1000)}t` : '—'} />
      </div>

      <div className="space-y-3">
        {logs.map(log => {
          const vol = totalVolume(log)
          const completedSets = log.exercises.flatMap(e => e.sets).filter(s => s.completed).length
          const totalSets = log.exercises.flatMap(e => e.sets).length

          return (
            <div key={log.id} className="bg-[#1a1a1a] rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold">{log.session_name}</p>
                  <p className="text-[#737373] text-xs mt-0.5">
                    {new Date(log.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(log.id)}
                  className="p-2 text-[#525252] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                  <Clock size={12} />
                  {formatDuration(log.duration_seconds)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                  <Trophy size={12} />
                  {completedSets}/{totalSets} séries
                </div>
                {vol > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                    <TrendingUp size={12} />
                    {Math.round(vol)} kg
                  </div>
                )}
              </div>

              {/* Exercise breakdown */}
              <div className="mt-3 space-y-1">
                {log.exercises.map(ex => {
                  const done = ex.sets.filter(s => s.completed).length
                  return (
                    <div key={ex.exercise_id} className="flex items-center justify-between text-xs">
                      <span className="text-[#a3a3a3] truncate max-w-[60%]">{ex.exercise_name}</span>
                      <span className={`font-medium ${done === ex.sets.length ? 'text-[#4ade80]' : 'text-[#737373]'}`}>
                        {done}/{ex.sets.length} séries
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-3 text-center">
      <p className="text-white font-bold text-lg">{value}</p>
      <p className="text-[#737373] text-xs mt-0.5">{label}</p>
    </div>
  )
}
