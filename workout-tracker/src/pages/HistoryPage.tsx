import { useState } from 'react'
import { Trash2, Clock, Trophy, TrendingUp, ChevronRight, X, Check, Minus, Zap, Flame, StickyNote } from 'lucide-react'
import type { WorkoutLog } from '../types/workout'
import { activityIntensityLabel, activityTypeLabel, muscleLabel } from '../utils/labels'
import { formatDurationSeconds } from '../utils/format'

interface Props {
  logs: WorkoutLog[]
  onDelete: (id: string) => void
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

function WorkoutDetail({ log, onClose, onDelete }: { log: WorkoutLog; onClose: () => void; onDelete: () => void }) {
  const vol = totalVolume(log)
  const completedSets = log.exercises.flatMap(e => e.sets).filter(s => s.completed).length
  const totalSets = log.exercises.flatMap(e => e.sets).length
  const isActivity = log.kind === 'activity'

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-2 -ml-2 text-[#737373]">
          <X size={20} />
        </button>
        <div className="text-center">
          <p className="font-semibold text-sm text-white truncate max-w-[180px]">{log.session_name}</p>
          <p className="text-xs text-[#737373]">
            {new Date(log.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={onDelete} className="p-2 -mr-2 text-[#525252] hover:text-red-400 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Summary stats */}
      <div className="flex gap-3 px-4 py-3 border-b border-[#1a1a1a] flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-[#737373]">
          <Clock size={13} className="text-[#f97316]" />
          {formatDurationSeconds(log.duration_seconds)}
        </div>
        {isActivity ? (
          <div className="flex items-center gap-1.5 text-xs text-[#737373]">
            <Zap size={13} className="text-[#f97316]" />
            {activityTypeLabel(log.activity_type ?? 'other')}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[#737373]">
            <Trophy size={13} className="text-[#f97316]" />
            {completedSets}/{totalSets} séries
          </div>
        )}
        {vol > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[#737373]">
            <TrendingUp size={13} className="text-[#f97316]" />
            {Math.round(vol)} kg volume
          </div>
        )}
        {log.activity_intensity && (
          <div className="flex items-center gap-1.5 text-xs text-[#737373]">
            <Flame size={13} className="text-[#f97316]" />
            {activityIntensityLabel(log.activity_intensity)}
          </div>
        )}
      </div>

      {/* Detail list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isActivity ? (
          <div className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
            <p className="text-white font-semibold">Resumo da atividade</p>
            {log.activity_calories != null && (
              <p className="text-sm text-[#a3a3a3] flex items-center gap-2"><Flame size={14} className="text-[#f97316]" />{log.activity_calories} kcal</p>
            )}
            {log.activity_notes && (
              <p className="text-sm text-[#a3a3a3] flex items-start gap-2"><StickyNote size={14} className="text-[#f97316] mt-0.5" />{log.activity_notes}</p>
            )}
            {!log.activity_notes && log.activity_calories == null && (
              <p className="text-sm text-[#737373]">Sem notas adicionais.</p>
            )}
          </div>
        ) : log.exercises.map(ex => {
          const completedCount = ex.sets.filter(s => s.completed).length
          const exVol = ex.sets.reduce((acc, s) => {
            if (s.completed && s.weight_kg && s.reps_done) return acc + s.weight_kg * s.reps_done
            return acc
          }, 0)

          return (
            <div key={ex.exercise_id} className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
              {/* Exercise header */}
              <div className="px-4 py-3 border-b border-[#2e2e2e]">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">{ex.exercise_name}</p>
                  <span className={`text-xs font-medium ${completedCount === ex.sets.length ? 'text-[#4ade80]' : 'text-[#737373]'}`}>
                    {completedCount}/{ex.sets.length} séries
                  </span>
                </div>
                <p className="text-[#525252] text-xs mt-0.5">{muscleLabel(ex.muscle)}</p>
                {ex.notes && (
                  <p className="text-[#737373] text-xs mt-1.5 italic">"{ex.notes}"</p>
                )}
                {exVol > 0 && (
                  <p className="text-[#737373] text-xs mt-1">Volume: {Math.round(exVol)} kg</p>
                )}
              </div>

              {/* Sets table */}
              <div>
                <div className="grid grid-cols-[32px_1fr_1fr_1fr_32px] gap-2 px-4 py-2 border-b border-[#2e2e2e]">
                  <span className="text-[10px] text-[#525252] font-semibold">#</span>
                  <span className="text-[10px] text-[#525252] font-semibold">Alvo</span>
                  <span className="text-[10px] text-[#525252] font-semibold">Peso</span>
                  <span className="text-[10px] text-[#525252] font-semibold">Reps</span>
                  <span />
                </div>
                {ex.sets.map(s => (
                  <div
                    key={s.set_number}
                    className={`grid grid-cols-[32px_1fr_1fr_1fr_32px] gap-2 items-center px-4 py-2.5 border-b border-[#2e2e2e] last:border-0 ${s.completed ? 'bg-[#0f2318]' : 'opacity-50'}`}
                  >
                    <span className="text-xs text-[#737373] font-semibold">{s.set_number}</span>
                    <span className="text-xs text-[#737373]">{s.reps_target}</span>
                    <span className="text-sm font-semibold text-white">
                      {s.weight_kg != null ? `${s.weight_kg} kg` : <Minus size={12} className="text-[#525252]" />}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {s.reps_done != null ? s.reps_done : <Minus size={12} className="text-[#525252]" />}
                    </span>
                    <span>
                      {s.completed
                        ? <Check size={14} className="text-[#4ade80]" />
                        : <Minus size={14} className="text-[#525252]" />}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HistoryPage({ logs, onDelete }: Props) {
  const [detail, setDetail] = useState<WorkoutLog | null>(null)

  if (detail) {
    return (
      <WorkoutDetail
        log={detail}
        onClose={() => setDetail(null)}
        onDelete={() => { onDelete(detail.id); setDetail(null) }}
      />
    )
  }

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
        <StatCard label="Tempo total" value={formatDurationSeconds(totalMins)} />
        <StatCard label="Volume (kg)" value={totalVol > 0 ? `${Math.round(totalVol / 1000)}t` : '—'} />
      </div>

      <div className="space-y-3">
        {logs.map(log => {
          const vol = totalVolume(log)
          const completedSets = log.exercises.flatMap(e => e.sets).filter(s => s.completed).length
          const totalSets = log.exercises.flatMap(e => e.sets).length
          const isActivity = log.kind === 'activity'

          return (
            <button
              key={log.id}
              onClick={() => setDetail(log)}
              className="w-full text-left bg-[#1a1a1a] rounded-2xl p-4 hover:bg-[#222] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold">{log.session_name}</p>
                  <p className="text-[#737373] text-xs mt-0.5">
                    {new Date(log.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <ChevronRight size={18} className="text-[#525252] mt-0.5" />
              </div>

              <div className="flex gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                  <Clock size={12} />
                  {formatDurationSeconds(log.duration_seconds)}
                </div>
                {isActivity ? (
                  <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                    <Zap size={12} />
                    {activityTypeLabel(log.activity_type ?? 'other')}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                    <Trophy size={12} />
                    {completedSets}/{totalSets} séries
                  </div>
                )}
                {vol > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                    <TrendingUp size={12} />
                    {Math.round(vol)} kg
                  </div>
                )}
              </div>

              {!isActivity && (
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
              )}
            </button>
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
