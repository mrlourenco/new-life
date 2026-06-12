import { Check } from 'lucide-react'
import type { Exercise, ExerciseLog } from '../../types/workout'

interface Props {
  exercises: Exercise[]
  exerciseLogs: ExerciseLog[]
  currentIndex: number
  onSelect: (idx: number) => void
}

export default function ExerciseNav({ exercises, exerciseLogs, currentIndex, onSelect }: Props) {
  return (
    <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
      {exercises.map((e, i) => {
        const done = exerciseLogs[i].sets.every(s => s.completed)
        const isCurrent = i === currentIndex
        return (
          <button
            key={e.id}
            onClick={() => onSelect(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isCurrent
                ? 'bg-[#f97316] text-white'
                : done
                ? 'bg-[#1a3320] text-[#4ade80]'
                : 'bg-[#1a1a1a] text-[#a3a3a3]'
            }`}
          >
            {done && !isCurrent ? <Check size={10} className="inline mr-1" /> : null}
            {e.name.split(' ').slice(0, 2).join(' ')}
          </button>
        )
      })}
    </div>
  )
}
