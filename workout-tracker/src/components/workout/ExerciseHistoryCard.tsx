import { History } from 'lucide-react'
import type { ExerciseHistory } from '../../hooks/useStore'

export default function ExerciseHistoryCard({ history }: { history?: ExerciseHistory }) {
  if (!history) return null
  const completedSets = history.sets.filter(s => s.weight_kg || s.reps_done)
  if (completedSets.length === 0) return null
  return (
    <div className="flex items-start gap-2 px-3 py-2 bg-[#0d1f0f] rounded-xl mb-2">
      <History size={13} className="text-[#4ade80] mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-[10px] text-[#4ade80] font-semibold mb-1">
          Última sessão · {new Date(history.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
        </p>
        <div className="flex flex-wrap gap-2">
          {completedSets.map((s, i) => (
            <span key={i} className="text-[10px] text-[#737373]">
              S{s.set_number}: {s.weight_kg ? `${s.weight_kg}kg` : '—'} × {s.reps_done ?? '—'}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
