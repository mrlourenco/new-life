interface Bar {
  label: string
  value: number
  isToday?: boolean
  onClick?: () => void
}

interface Props {
  bars: Bar[]
  target?: number
}

export default function CalorieChart({ bars, target }: Props) {
  const max = Math.max(...bars.map(b => b.value), target ?? 0, 1)

  return (
    <div className="flex items-end gap-1.5 h-28">
      {bars.map((bar, i) => {
        const pct = Math.min((bar.value / max) * 100, 100)
        const targetPct = target ? Math.min((target / max) * 100, 100) : null
        const atTarget = target && bar.value >= target * 0.85 && bar.value <= target * 1.15
        const over = target && bar.value > target * 1.15
        const color = bar.value === 0
          ? 'bg-[#2e2e2e]'
          : over
            ? 'bg-red-500/80'
            : atTarget
              ? 'bg-[#22c55e]/80'
              : 'bg-[#f97316]/60'

        return (
          <button
            key={i}
            onClick={bar.onClick}
            className="flex-1 flex flex-col items-center gap-1 group"
          >
            <div className="w-full flex flex-col justify-end relative" style={{ height: '88px' }}>
              {targetPct !== null && (
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-[#525252]"
                  style={{ bottom: `${targetPct}%` }}
                />
              )}
              <div
                className={`w-full rounded-t-md transition-all ${color} ${bar.isToday ? 'ring-1 ring-[#f97316]' : ''}`}
                style={{ height: `${Math.max(pct, bar.value > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className={`text-[9px] font-medium ${bar.isToday ? 'text-[#f97316]' : 'text-[#525252]'}`}>
              {bar.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function MacroLegend() {
  return (
    <div className="flex gap-3 text-[10px] text-[#525252]">
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#22c55e]/80 inline-block" />No objetivo</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#f97316]/60 inline-block" />Abaixo</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/80 inline-block" />Acima</span>
    </div>
  )
}
