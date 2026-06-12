import { Check } from 'lucide-react'
import type { SetLog } from '../../types/workout'

interface Props {
  set: SetLog
  index: number
  restSeconds: number
  onUpdateSet: (setIdx: number, field: keyof SetLog, value: number | boolean | string) => void
  onCompleteSet: (setIdx: number, restSecs: number) => void
  onUncompleteSet: (setIdx: number) => void
}

export default function SetRow({ set: s, index: i, restSeconds, onUpdateSet, onCompleteSet, onUncompleteSet }: Props) {
  return (
    <div
      className={`grid grid-cols-[40px_1fr_1fr_48px] gap-2 items-center px-4 py-3 border-b border-[#2e2e2e] last:border-0 transition-colors ${s.completed ? 'bg-[#0f2318]' : ''}`}
    >
      <span className={`text-sm font-bold ${s.completed ? 'text-[#4ade80]' : 'text-[#737373]'}`}>
        {s.completed ? <Check size={16} /> : i + 1}
      </span>
      <input
        type="number"
        min="0"
        step="0.5"
        value={s.weight_kg ?? ''}
        onChange={e => onUpdateSet(i, 'weight_kg', parseFloat(e.target.value) || 0)}
        disabled={s.completed}
        placeholder="—"
        className="w-full bg-[#0f0f0f] rounded-lg px-2 py-2 text-sm text-white text-center disabled:opacity-40 border border-[#2e2e2e] focus:border-[#f97316] focus:outline-none"
      />
      <input
        type="number"
        min="0"
        value={s.reps_done ?? ''}
        onChange={e => onUpdateSet(i, 'reps_done', parseInt(e.target.value) || 0)}
        disabled={s.completed}
        placeholder={s.reps_target}
        className="w-full bg-[#0f0f0f] rounded-lg px-2 py-2 text-sm text-white text-center disabled:opacity-40 border border-[#2e2e2e] focus:border-[#f97316] focus:outline-none"
      />
      <button
        onClick={() => s.completed ? onUncompleteSet(i) : onCompleteSet(i, restSeconds)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          s.completed
            ? 'bg-[#166534] text-[#4ade80]'
            : 'bg-[#f97316] text-white hover:bg-[#ea6c0a]'
        }`}
      >
        <Check size={18} />
      </button>
    </div>
  )
}
