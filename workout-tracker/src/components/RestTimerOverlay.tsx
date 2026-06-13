import { X, SkipForward } from 'lucide-react'

interface Props {
  seconds: number
  total: number
  progress: number
  onSkip: () => void
  onCancel: () => void
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function RestTimerOverlay({ seconds, total, progress, onSkip, onCancel }: Props) {
  const radius = 54
  const circ = 2 * Math.PI * radius
  const dash = circ * (1 - progress)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8">
        <p className="text-[#a3a3a3] text-sm uppercase tracking-widest font-semibold">Descanso</p>

        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128" width="144" height="144">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="#2e2e2e" strokeWidth="8" />
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="#f97316"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="text-5xl font-bold tabular-nums">{formatTime(seconds)}</span>
        </div>

        <p className="text-[#737373] text-xs">de {formatTime(total)}</p>

        <div className="flex gap-4 mt-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] text-[#a3a3a3] text-sm hover:border-red-500/50 transition-colors"
          >
            <X size={16} />
            Anular série
          </button>
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#f97316] text-white font-semibold text-sm hover:bg-[#ea6c0a] transition-colors"
          >
            <SkipForward size={16} />
            Saltar
          </button>
        </div>
      </div>
    </div>
  )
}
