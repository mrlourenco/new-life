import { useState, useRef, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { searchExercises, type ExerciseEntry } from '../../data/exercises'
import { MUSCLES } from './planBuilderConstants'

interface Props {
  onSelect: (entry: ExerciseEntry) => void
  onClose: () => void
}

export default function ExercisePicker({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  const results = searchExercises(query, muscle)

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-[#1a1a1a]">
        <button onClick={onClose} className="p-1 text-[#a3a3a3]">
          <X size={20} />
        </button>
        <h2 className="text-white font-semibold flex-1">Escolher exercício</h2>
      </div>

      <div className="px-4 py-3 border-b border-[#1a1a1a] space-y-3">
        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3 py-2.5">
          <Search size={16} className="text-[#525252] flex-shrink-0" />
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Pesquisar exercício..."
            className="flex-1 bg-transparent text-white text-sm placeholder-[#525252] outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setMuscle(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${!muscle ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40' : 'bg-[#1a1a1a] text-[#737373] border border-[#2e2e2e]'}`}
          >
            Todos
          </button>
          {MUSCLES.map(m => (
            <button
              key={m}
              onClick={() => setMuscle(muscle === m ? null : m)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${muscle === m ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40' : 'bg-[#1a1a1a] text-[#737373] border border-[#2e2e2e]'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {results.length === 0 ? (
          <p className="text-center text-[#525252] text-sm py-8">
            Sem resultados — fecha e escreve o nome manualmente.
          </p>
        ) : (
          <div className="space-y-1">
            {results.map(ex => (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="w-full flex items-center justify-between px-3 py-3 bg-[#1a1a1a] rounded-xl text-left hover:bg-[#222]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{ex.name}</p>
                  <p className="text-[10px] text-[#525252] mt-0.5 capitalize">{ex.muscle} · {ex.equipment}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
